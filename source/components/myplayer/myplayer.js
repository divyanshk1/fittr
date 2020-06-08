import React, { Component } from 'react'
import ReactPlayer from 'react-player'

class Myplayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: props.url,
      pip: false,
      playing: false,
      controls: true,
      light: props.image_url? props.image_url : true,
      volume: 0.8,
      muted: false,
      played: 0,
      loaded: 0,
      duration: 0,
      playbackRate: 1.0,
      loop: false
    }
  }

  handlePlay = () => {
    this.setState({ playing: true })
  }

  handleEnablePIP = () => {
    this.setState({ pip: true })
  }

  handleDisablePIP = () => {
    this.setState({ pip: false })
  }

  handlePause = () => {
    this.setState({ playing: false })
  }

  handleProgress = state => {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
  }

  handleEnded = () => {
    this.setState({ playing: this.state.loop })
  }

  handleDuration = (duration) => {
    this.setState({ duration })
  }

  renderLoadButton = (url, label) => {
    return (
      <button onClick={() => this.load(url)}>
        {label}
      </button>
    )
  }

  ref = player => {
    this.player = player
  }

  render () {
    const { url, playing, controls, light, volume, muted, loop, playbackRate, pip } = this.state

    return (
      <div className='app'>
        <section className='section'>
          <div className='player-wrapper'>
            <ReactPlayer
              ref={this.ref}
              className='react-player'
              width='300px'
              height='200px'
              url={url}
              pip={pip}
              playing={playing}
              controls={controls}
              light={light}
              loop={loop}
              playbackRate={playbackRate}
              volume={volume}
              muted={muted}
              onPlay={this.handlePlay}
              onEnablePIP={this.handleEnablePIP}
              onDisablePIP={this.handleDisablePIP}
              onPause={this.handlePause}
              onEnded={this.handleEnded}
              onProgress={this.handleProgress}
              onDuration={this.handleDuration}
            />
          </div>
        </section>
      </div>
    )
  }
}

export default Myplayer
