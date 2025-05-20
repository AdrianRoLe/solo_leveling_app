import { DEFAULT_COLOR_SCHEME } from './Constants.tsx';
import { IExercise, IUser } from './Interfaces.tsx';

class User implements IUser {
	id: string;
	username: string;
	password: string;
	global_level: number;
	global_exp: number;
	exercises: IExercise[];
	colorScheme: string;
	trophies: string[];

	constructor(username: string, password: string) {
		this.id = crypto.randomUUID();
		this.username = username;
		this.password = password;
		this.global_level = 1;
		this.global_exp = 0;
		this.exercises = [];
		this.colorScheme = DEFAULT_COLOR_SCHEME;
		this.trophies = [];
	}
}

export default User;
