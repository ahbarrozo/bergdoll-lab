CREATE OR REPLACE FUNCTION create_unsubscribe_token(
    p_email VARCHAR(255),
    p_secret TEXT
) RETURNS TEXT AS $$
DECLARE
    payload TEXT;
    signature TEXT;
BEGIN
    IF p_secret IS NULL OR p_secret = '' THEN
        RAISE EXCEPTION 'Secret is required';
    END IF;
    
    SELECT encode(
        json_build_object(
            'email', p_email,
            'timestamp', (extract(epoch from now()) * 1000)::BIGINT,
            'action', 'unsubscribe'
        )::text::bytea, 
        'base64'
    ) INTO payload;
    
    SELECT encode(
        hmac(
            decode(payload, 'base64'),
            p_secret::bytea,
            'sha256'
        ),
        'base64'
    ) INTO signature;
    
    RETURN payload || '.' || signature;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_unsubscribe_token(
    p_token TEXT,
    p_secret TEXT,
    p_max_age_hours INTEGER DEFAULT 24
) RETURNS TABLE (
    is_valid BOOLEAN,
    email VARCHAR(255),
    error_message TEXT,
    timestamp_unix BIGINT,
    age_hours INTEGER
) AS $$
DECLARE
    v_secret TEXT;
    v_payload TEXT;
    v_provided_signature TEXT;
    v_expected_signature TEXT;
    v_decoded_payload JSON;
    v_email VARCHAR(255);
    v_timestamp BIGINT;
    v_current_timestamp BIGINT;
    v_age_ms BIGINT;
    v_age_hours INTEGER;
    v_max_age_ms BIGINT;
    v_token_parts TEXT[];
BEGIN
    is_valid := FALSE;
    email := NULL;
    error_message := NULL;
    timestamp_unix := NULL;
    age_hours := NULL;
    
    IF p_secret IS NULL OR p_secret = '' THEN
        RAISE EXCEPTION 'Secret is required';
    END IF;
    
    v_token_parts := string_to_array(p_token, '.');
    
    IF array_length(v_token_parts, 1) != 2 THEN
        RAISE EXCEPTION 'Secret is required';
    END IF;
    
    v_payload := v_token_parts[1];
    v_provided_signature := v_token_parts[2];
    
    BEGIN
        SELECT convert_from(decode(v_payload, 'base64'), 'UTF8')::json INTO v_decoded_payload;
        
        v_email := v_decoded_payload->>'email';
        v_timestamp := (v_decoded_payload->>'timestamp')::BIGINT;

        SELECT encode(
            hmac(
                decode(v_payload, 'base64'),
                v_secret::bytea,
                'sha256'
            ),
            'base64'
        ) INTO v_expected_signature;
        
        IF v_provided_signature != v_expected_signature THEN
            RAISE EXCEPTION 'Invalid signature';
        END IF;
        
        v_current_timestamp := (extract(epoch from now()) * 1000)::BIGINT;
        v_age_ms := v_current_timestamp - v_timestamp;
        v_age_hours := (v_age_ms / (1000 * 60 * 60))::integer;
        v_max_age_ms := p_max_age_hours * 60 * 60 * 1000;
        
        IF v_age_ms > v_max_age_ms THEN
            RAISE EXCEPTION 'Token expired';
        END IF;
        
        is_valid := TRUE;
        email := v_email;
        timestamp_unix := v_timestamp;
        age_hours := v_age_hours;
    END;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION unsubscribe_with_token(
    p_token TEXT,
    p_secret TEXT
) RETURNS TABLE (
    success BOOLEAN,
    email VARCHAR(255),
    error_message TEXT,
    rows_affected INTEGER
) AS $$
DECLARE
    v_verification RECORD;
    v_rows_affected INTEGER := 0;
BEGIN
    success := FALSE;
    email := '';
    error_message := '';
    rows_affected := 0;
    
    IF p_secret IS NULL OR p_secret = '' THEN
        RAISE EXCEPTION 'Secret is required';
    END IF;
    
    SELECT * FROM verify_unsubscribe_token(p_token, p_secret) INTO v_verification;
    
    IF NOT v_verification.is_valid THEN
        RAISE EXCEPTION 'Token is invalid';
    END IF;
    
    BEGIN
        DELETE FROM emails 
        WHERE emails.email = v_verification.email;
        
        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
        
        IF v_rows_affected = 0 THEN
            RAISE EXCEPTION 'Email address not found in database';
        ELSE
            success := TRUE;
            email := v_verification.email;
            rows_affected := v_rows_affected;
        END IF;
    END;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;