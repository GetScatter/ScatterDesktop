import ding from '../assets/sounds/ding.mp3'

export default class SoundService {

	static ding(){
		const audio = new Audio(ding);
		audio.currentTime = 0;
		audio.play();
	}

}