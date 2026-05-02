import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

import { mockClient } from "aws-sdk-client-mock";
import { S3Client } from "@aws-sdk/client-s3";

let mongo: any;
export const s3Mock = mockClient(S3Client);

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  s3Mock.reset();
  const collections = await mongoose.connection.db?.collections();
  if (collections) {
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
