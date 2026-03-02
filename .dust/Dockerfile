FROM oven/bun:1

RUN apt-get update && apt-get install -y git nodejs npm && rm -rf /var/lib/apt/lists/*

# Install Claude Code globally
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /workspace
