import logo from './logo.svg';
import './App.css';
import React from 'react';
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'


function reducer(state, action) {
	console.log(`reducer: action.type = ${action.type}`);
  switch (action.type) {
	  case 'setTemperatureUnit': 
		if (action.unit === 'fahrenheit') {
			return {forecast: state.forecast, temperatureUnit: "fahrenheit" };
		}
		else { // 'centigrade':
			let forecastC = getForecastInCurrentUnits(state.forecast, 'centigrade');
			console.log(`reducer: action.type = ${action.type} forecastC = ${JSON.stringify(forecastC)}`);
			return {forecast: forecastC, temperatureUnit: "centigrade" };
		}
	  break;
	  case 'setForecast': 	  
		let newState = {...state, forecast: getForecastInCurrentUnits(action.forecast, state.temperatureUnit) };
		return newState;
    default:
      throw new Error();
  }
}

function getButtonVariant(state, tempUnit) {
	if (state.temperatureUnit === tempUnit) 
		return 'info';
	return 'light';
}

function getForecastInCurrentUnits(forecast, tempUnit) {
	if (tempUnit === "centigrade") {
		const temperature = (forecast.temperature - 32) / 9 * 5;		
		const convertedForecast = {...forecast, temperature: temperature.toFixed()};
		return convertedForecast
	}
	return forecast;
}

function App() {
	const initialState = {forecast: {}, temperatureUnit: "fahrenheit"};
	let myInterval = React.useRef(null);
	const [state, dispatch] = React.useReducer(reducer, initialState);
	//let interval;
  
	React.useEffect(() => {    
		async function getNewForecast(i) {
			const response = await fetch('/api/forecasts');
			const forecasts = await response.json();
			if (response.status !== 200) {
				throw Error(forecasts.message);
			}
			console.log(`getNewForecast: i = ${i}`);
			dispatch({type: 'setForecast', forecast: forecasts[i]})
		}
		console.log(`useEffect is running`);
		//interval = setInterval(() => getNewForecast(Math.floor(Math.random() * 10)), 5000);		
		myInterval.current = setInterval(() => getNewForecast(Math.floor(Math.random() * 10)), 5000);

		return () => {
			console.log('Alert removed');
			//clearInterval(interval);
			clearInterval(myInterval.current);
		};

	}, []);
	
  return (
     <Alert variant="info" className="weather-alert">
	  <Alert.Heading className="weather-title text-center">My Austin weather alert</Alert.Heading>
	  <div className="weather-title">
	  <Button onClick={() => dispatch({type: 'setTemperatureUnit', unit: 'fahrenheit'})} variant={getButtonVariant(state, "fahrenheit")}>F</Button>
	  <Button onClick={() => dispatch({type: 'setTemperatureUnit', unit: 'centigrade'})} variant={getButtonVariant(state, "centigrade")}>C</Button>
	  </div>
		<div className="weather-title">
		<ListGroup className="weather-alert">
		  <ListGroup.Item><b>Weather</b>: {state.forecast.weather}</ListGroup.Item>
		  <ListGroup.Item><b>Rain chance</b>: {state.forecast.rainchance}</ListGroup.Item>
		  <ListGroup.Item><b>Temperature</b>: {state.forecast.temperature}</ListGroup.Item>
		</ListGroup>		
		</div>
	</Alert>
  );
}

export default App;
