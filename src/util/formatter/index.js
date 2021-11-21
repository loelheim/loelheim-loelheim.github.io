import Moment from "moment"
import "moment-timezone"

export const formatTime = date => {
  return Moment(date, Moment.ISO_8601)
    .tz("Asia/Seoul")
    .format("YYYY년 MM월 DD일 HH:mm:ss")
}
