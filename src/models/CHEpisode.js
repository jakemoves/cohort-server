class CHEpisode {
  episodeNumber
  label
  cues

  constructor(episodeNumber, label, cues = []){
    this.episodeNumber = episodeNumber
    this.label = label
    this.cues = cues
  }
}

module.exports = CHEpisode