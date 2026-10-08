#!/usr/bin/env bash
set -e

fly secrets import < back/.env
fly deploy
