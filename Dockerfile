FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# Install necessary dependencies
RUN apt-get update && apt-get install -y curl

# Install nvm
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=23.11.0
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Add node and npm to path so the commands are available
ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Set up your project
WORKDIR /app
COPY . .
RUN npm install
RUN npx playwright install --with-deps

ENTRYPOINT ["npx", "playwright", "test"]
