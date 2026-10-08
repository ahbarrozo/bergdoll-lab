// AudioExtension.ts
import { Node, mergeAttributes } from '@tiptap/core';

export interface AudioOptions {
    HTMLAttributes: Record<string, any>;
}

const Audio = Node.create<AudioOptions>({
    name: 'audio',

    group: 'block',

    atom: true,

    draggable: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: element => element.getAttribute('src'),
                renderHTML: attributes => {
                    if (!attributes.src) {
                        return {};
                    }
                    return {
                        src: attributes.src,
                    };
                },
            },
            controls: {
                default: true,
                parseHTML: element => element.hasAttribute('controls'),
                renderHTML: attributes => {
                    if (!attributes.controls) {
                        return {};
                    }
                    return {
                        controls: 'controls',
                    };
                },
            },
            autoplay: {
                default: false,
                parseHTML: element => element.hasAttribute('autoplay'),
                renderHTML: attributes => {
                    if (!attributes.autoplay) {
                        return {};
                    }
                    return {
                        autoplay: 'autoplay',
                    };
                },
            },
            loop: {
                default: false,
                parseHTML: element => element.hasAttribute('loop'),
                renderHTML: attributes => {
                    if (!attributes.loop) {
                        return {};
                    }
                    return {
                        loop: 'loop',
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'audio',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addNodeView() {
        return ({ node, HTMLAttributes }) => {
            const dom = document.createElement('div');
            dom.className = 'audio-wrapper';
            dom.setAttribute('data-type', 'audio');

            const audio = document.createElement('audio');

            // Set attributes
            if (node.attrs.src) {
                audio.src = node.attrs.src;
            }
            if (node.attrs.controls) {
                audio.controls = true;
            }
            if (node.attrs.autoplay) {
                audio.autoplay = true;
            }
            if (node.attrs.loop) {
                audio.loop = true;
            }

            // Merge any additional HTML attributes
            Object.entries(HTMLAttributes).forEach(([key, value]) => {
                if (key !== 'src' && key !== 'controls' && key !== 'autoplay' && key !== 'loop') {
                    audio.setAttribute(key, value);
                }
            });

            dom.appendChild(audio);

            return {
                dom,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== 'audio') {
                        return false;
                    }

                    // Update audio element when node updates
                    if (updatedNode.attrs.src) {
                        audio.src = updatedNode.attrs.src;
                    }
                    audio.controls = updatedNode.attrs.controls;
                    audio.autoplay = updatedNode.attrs.autoplay;
                    audio.loop = updatedNode.attrs.loop;

                    return true;
                },
            };
        };
    }
});

export default Audio;