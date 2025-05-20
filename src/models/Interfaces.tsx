import { EXERCISE_TYPES } from "./Constants";

export interface IUser {
	id: string;
	username: string;
	password: string;
	global_level: number;
	global_exp: number;
	exercises: IExercise[];
	colorScheme: string;
	trophies: string[];
}


export interface IExercise {
	id: string;
	name: string;
	category: EXERCISE_TYPES;
	level: number;
	exp: number;
	start_date: Date;
	start_weight: number;
	current_weight: number;
}


