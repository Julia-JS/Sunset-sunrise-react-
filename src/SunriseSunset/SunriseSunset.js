import React, {Component} from 'react';
import './SunriseSunset.css';
import Spinner from '../UI/Spinner/Spinner';
import Button from '../UI/Button/Button';

class SunriseSunset extends Component {
  state = {
    currentDate: new Date(),
    location: '',
    sunrise: '',
    sunset: '',
    day_length: '',
    civil_twilight_begin: '',
    civil_twilight_end: '',
    error: false,
    loading: false
  };

  componentDidMount() {
    this.findCoordinates();
  }

  findCoordinates = () => {
    this.setState({loading: true});

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const success = (pos) => {
      const crd = pos.coords;
      this.setState({location: crd});
      this.fetchData(this.state.location.latitude, this.state.location.longitude, this.state.currentDate);
    };

    const error = () => {
      this.setState({error: true});
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  };

  transformDate = (date) => {
    return `${date.getFullYear()}-${+date.getMonth() + 1}-${date.getDate()}`;
  };

  fetchData(lat, lon, curDate) {
    this.setState({loading: true});
    const curDateTransformed = this.transformDate(curDate);

    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${curDateTransformed}&formatted=0`;

    fetch(url)
      .then(res => res.json())
      .then(json => {
        this.setState({
          sunrise: json.results.sunrise,
          sunset: json.results.sunset,
          day_length: json.results.day_length,
          civil_twilight_begin: json.results.civil_twilight_begin,
          civil_twilight_end: json.results.civil_twilight_end
        });
        this.setState({loading: false});
      })
      .catch(() => {
        this.setState({error: true});
        this.setState({loading: false});
      });
  };

  onClickHandler = (days) => {
    this.setState({
      currentDate: new Date(this.state.currentDate.setDate(new Date(this.state.currentDate).getDate() + days))
    });

    this.fetchData(this.state.location.latitude, this.state.location.longitude, this.state.currentDate);
  };

  render() {
    const buttonsArray = [
      {text: '-7 days', value: -7},
      {text: '-1 day', value: -1},
      {text: '+1 day', value: 1},
      {text: '+7 days', value: 7}
    ];

    const buttons = buttonsArray.map(button => {
      return (
        <Button
          key={button.text + button.value}
          disabled={this.state.loading}
          clicked={() => this.onClickHandler(button.value)}
          text={button.text}/>
      );
    });

    const currentDate = new Intl.DateTimeFormat('en-US', {month: 'numeric',
                                                                         day: 'numeric',
                                                                         year: 'numeric'
                                                                        }).format(this.state.currentDate);

    let sunriseDate = '';
    let sunsetDate = '';
    let dayLength = '';
    let gradientLeft = '';
    let dayWidth = '';
    let gradientRight = '';

    let data = this.state.error ? <div className="Error">Something went wrong!<br/>Data can't be loaded.</div> : <Spinner/>;

    if (!this.state.error && !this.state.loading && this.state.sunrise) {
      sunriseDate = new Intl.DateTimeFormat('en-US', {hour: '2-digit',
                                                                     minute: '2-digit',
                                                                     hour12: false
                                                                    }).format(new Date(this.state.sunrise));

      sunsetDate = new Intl.DateTimeFormat('en-US', {hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: false
                                                                   }).format(new Date(this.state.sunset));

      dayLength = new Date(this.state.day_length * 1000).toISOString().substr(11, 5);

      gradientLeft = Math.round((new Date(this.state.sunrise) - new Date(this.state.civil_twilight_begin)) / 60000) * 100 / 1440;

      dayWidth = Math.round(this.state.day_length / 60) * 100 / 1440;

      gradientRight = Math.round((new Date(this.state.civil_twilight_end) - new Date(this.state.sunset)) / 60000) * 100 / 1440;

      data = (
        <div className="Data">
          <div className="Item">
            <span>Sunrise: </span>
            {sunriseDate}
          </div>
          <div className="Item">
            <span>Sunset: </span>
            {sunsetDate}
          </div>
          <div className="Item">
            <span>Length: </span>
            {dayLength}
          </div>
        </div>
      );
    }

    return (
      <div className="SunriseSunset">
        <div className="Title">
          {currentDate}
        </div>
        {data}
        <div className="Buttons">
          {buttons}
        </div>
        <div className="Line">
          <div
            className="Gradient GradientLeft"
            style={{width: gradientLeft ? gradientLeft + '%' : '0'}}>
          </div>
          <div
            className="Day"
            style={{width: dayWidth ? dayWidth + '%' : '0'}}>
          </div>
          <div
            className="Gradient GradientRight"
            style={{width: gradientRight ? gradientRight + '%' : '0'}}>
          </div>
        </div>
      </div>
    );
  }
}

export default SunriseSunset;
