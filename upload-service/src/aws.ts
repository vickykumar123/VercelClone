import {S3} from "aws-sdk";
import fs from "fs";

const s3 = new S3({
  accessKeyId: process.env.AccessKeyId,
  secretAccessKey: process.env.SecretAccessKey,
  endpoint: process.env.Endpoint,
});

// fileName => output/12312/src/App.jsx --> cleaner path
// filePath => /Users/name/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel",
      Key: fileName,
    })
    .promise();
};
