import { EXERCISE_TYPES } from "./Constants.tsx";
import { IExercise } from "./Interfaces.tsx";

class Exercise {

	private exerciseData: IExercise;

	constructor(
		public name: string,
	) {
		this.exerciseData = this.createDefaultExercise(name);
	}

	private createDefaultExercise(
		name: string,
	): IExercise {
		return {
			id: Math.random().toString(36).substring(2, 15),
			name,
			level: 1,
			category: EXERCISE_TYPES.STRENGTH,
			exp: 0,
			start_date: new Date(),
			start_weight: 0,
			current_weight: 0
		};
	}

	get data(): IExercise {
		return this.exerciseData;
	}

	fromJson(json: IExercise): void {
		this.exerciseData = json;
	}

	toJson(): IExercise {
		return this.exerciseData;
	}
}

export default Exercise;