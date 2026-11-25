import { Router } from 'express';
import { AirQualityController } from './airQualityController';

const router = Router();

router.get('/current', AirQualityController.getCurrent);
router.get('/forecast', AirQualityController.getForecast);
router.get('/stations', AirQualityController.getNearbyStations);
router.get('/weather', AirQualityController.getWeather);

export default router;
