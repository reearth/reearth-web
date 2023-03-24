import {
  BORDER_WIDTH,
  EPOCH_SEC,
  MINUTES_SEC,
  NORMAL_SCALE_WIDTH,
  PADDING_HORIZONTAL,
} from "./constants";

const MONTH_LABEL_LIST = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatDateForTimeline = (time: number, options: { detail?: boolean } = {}) => {
  const d = new Date(time);
  const year = d.getFullYear();
  const month = MONTH_LABEL_LIST[d.getMonth()];
  const date = `${d.getDate()}`.padStart(2, "0");
  const hour = `${d.getHours()}`.padStart(2, "0");
  if (!options.detail) {
    return `${month} ${date} ${year} ${hour}:00:00.00`;
  }
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const seconds = `${d.getSeconds()}`.padStart(2, "0");
  return `${month} ${date} ${year} ${hour}:${minutes}:${seconds}.00`;
};

const collapseScaleInterval = (interval: number) => {
  if (interval < 10) {
    return interval < 5 ? 1 : 5;
  }
  if (10 <= interval && interval <= 30) {
    return 10 * Math.round(interval / 10);
  }
  return 60 * Math.round(interval / 60);
};

export const calcScaleInterval = (
  rangeDiff: number,
  zoom: number,
  styles: { width: number; gap: number },
) => {
  const numberOfScales =
    (styles.width - (PADDING_HORIZONTAL + BORDER_WIDTH) * 2) / (styles.gap + NORMAL_SCALE_WIDTH);
  const scaleInterval =
    collapseScaleInterval(rangeDiff / (MINUTES_SEC * EPOCH_SEC) / numberOfScales) * MINUTES_SEC;
  const zoomedScaleInterval = Math.max(Math.trunc(scaleInterval / zoom), MINUTES_SEC);
  const strongScaleMinutes = Math.trunc(10);

  return {
    scaleInterval: zoomedScaleInterval,
    strongScaleMinutes,
  };
};
