module.exports = function CHMessage(domain, cueNum, cueAct) {
  let mediaDomains = {
    "sound": 0,
    "video": 1,
    "text": 2
  }
  mediaDomains.freeze

  let msg = {}
  msg.mediaDomain = mediaDomains[domain]
  msg.cueNumber = cueNum
  msg.cueAction = cueAct
  return msg
}