import { IExercise, IUser } from './Interfaces';

class User implements IUser {
	id: string;
	username: string;
	password: string;
	global_level: number;
	global_exp: number;
	exercises: IExercise[];

	constructor(username: string, password: string) {
		this.id = crypto.randomUUID();
		this.username = username;
		this.password = password;
		this.global_level = 1;
		this.global_exp = 0;
		this.exercises = [];
	}
}

export default User;
