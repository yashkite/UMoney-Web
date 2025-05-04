#!/bin/bash

# Install backend testing dependencies
cd umoney-backend
npm install --save-dev jest supertest mongodb-memory-server cross-env

# Install frontend testing dependencies
cd ../umoney-frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event msw jest-environment-jsdom

# Return to root directory
cd ..
