module.exports = function CHMessage(domain, cueNum, cueAct) {
  let mediaDomains = {
    "sound": 0,
    "video": 1,
    "text": 2
  }
  mediaDomains.freeze

  let cueActions = {
    "play": 0,
    "pause": 1,
    "restart": 2,
    "stop": 3
  }

  let msg = {
    targetTags: ["all"],
    mediaDomain: "" + mediaDomains[domain],
    cueNumber: cueNum,
    cueAction: "" + cueActions[cueAct]
  }
  
  return msg
}