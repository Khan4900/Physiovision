import { SquatCounter } from "./squatCounter";
import { PushupCounter } from "./pushupCounter";
import { JumpingJacksCounter } from "./jumpingJacksCounter";
import { PikeWalkCounter } from "./pikeWalkCounter";
import { PullUpsCounter } from "./pullUpsCounter";
import { BicycleCrunchesCounter } from "./bicycleCrunchesCounter";
import { LungesCounter } from "./lungesCounter";
import { BicepCurlsCounter } from "./bicepCurlsCounter";
import { SitUpsCounter } from "./sitUpsCounter";
import { YogaCounter } from "./yogaCounter.js";
import { PlankCounter } from "./plankCounter";

export const exerciseCounterLoader = {
  // Specify the exercise ID and the corresponding counter class
  "ed999b28-ae50-4009-b29c-c7f6a28857c9": PushupCounter,
  "fb7180ab-f3e2-4a5d-b731-a2c0fc5de9fa": SquatCounter,
  "7c12ed44-7dac-4b42-90c3-aa9a02dd251d": PlankCounter,
  // Demo/local IDs for strength exercises
  "1": PushupCounter,
  "2": SquatCounter,
  "3": JumpingJacksCounter,
  "4": PlankCounter,
  "5": LungesCounter,
  "6": PullUpsCounter,
  "7": BicepCurlsCounter,
  "8": BicycleCrunchesCounter,
  "9": SitUpsCounter,
  "10": PikeWalkCounter,
  // Yoga exercise IDs
  "11": () => new YogaCounter('tadasana'),
  "12": () => new YogaCounter('warrior-i'),
  "13": () => new YogaCounter('warrior-ii'),
  "14": () => new YogaCounter('vrksasana'),
  "15": () => new YogaCounter('chair-pose'),
  "16": () => new YogaCounter('eagle'),
  "17": () => new YogaCounter('garland'),
  "18": () => new YogaCounter('half-moon'),
  "19": () => new YogaCounter('bigtoe-pose'),
  "20": () => new YogaCounter('gate'),
  "21": () => new YogaCounter('parivrtta-trikonasana'),
  "22": () => new YogaCounter('dance'),
};
