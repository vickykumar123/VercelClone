import {commandOptions} from "redis";
import subscriber from "./redis/client";
import publisher from "./redis/client";
import {copyFinalDist, downloadS3Folder} from "./aws";
import {buildProject} from "./build";

async function main() {
  while (1) {
    const response = await subscriber.brPop(
      commandOptions({isolated: true}),
      "build-queue",
      0
    );
    const id = response?.element;
    await downloadS3Folder(`repoClone/${id}`);
    await buildProject(id!);
    copyFinalDist(id!);
    await publisher.hSet("status", id!, "deployed");
  }
}
main();
