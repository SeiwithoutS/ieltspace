import { createGradingService } from '../modules/grading/grading.service.js';

export async function runGradingDispatch(grading = createGradingService()) {
  for (let batch = 0; batch < 25; batch++) {
    if (!await grading.expireNext()) break;
  }
  for (let batch = 0; batch < 25; batch++) {
    if (!await grading.assignNext()) break;
  }
}
