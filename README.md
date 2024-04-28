# Event Driven File Upload

This repository contains a demo implementation of an event-driven file upload system. The project showcases how to efficiently handle file uploads in a microservices architecture using event-driven principles.

# Overview

The event-driven file upload demo is designed to demonstrate the capabilities of handling large file uploads and processing them in an asynchronous manner within a microservices environment. This approach helps in decoupling the services and allows for scalable and resilient system design.

## Demo

![Demo](event-driven-file-upload.gif)

## Tech Stack

**Client:** Nextjs 13, TailwindCSS, UI(Shadcn)

**Server:** Nodejs, AWS Lambda, AWS SNS, AWS S3, AWS DynamoDB

Note: We mainly uses [Serverless Framework](https://www.serverless.com/) to develop and deploy AWS lambda.

### Prerequisites

You need an AWS Account to deploy AWS Serverless and Step functions.

## Installation

Project mainly split into `client` and `server` side of code.

### Server Setup

### Dependacies

```bash
 cd server
 npm install
```

#### To deploy

```bash
 npm run deploy
```

### Client Setup

### Install Dependencies

```bash
  cd client
  npm install
```
