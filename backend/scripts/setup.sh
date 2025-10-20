#!/bin/bash

# Create uploads directory
mkdir -p uploads

# Create default audio directory
mkdir -p uploads/audio/default

# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file. Please update it with your configuration."
fi

echo "Setup complete!"

