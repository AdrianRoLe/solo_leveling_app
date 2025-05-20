import { IUser } from "./Interfaces";

class DatabaseUser {
	public db: IDBDatabase;

	constructor(db: IDBDatabase) {
		this.db = db;
	}

	private saveToFile(user: IUser): void {
		const storageKey = 'userDatabase';
		let users: IUser[] = [];

		// Read existing data from localStorage
		const storedData = localStorage.getItem(storageKey);
		if (storedData) {
			users = JSON.parse(storedData);
		}

		// Check if the user already exists
		const existingUserIndex = users.findIndex((u: IUser) => u.id === user.id);
		if (existingUserIndex !== -1) {
			// Update existing user
			users[existingUserIndex] = user;
		} else {
			// Add new user
			users.push(user);
		}

		// Write updated data back to localStorage
		localStorage.setItem(storageKey, JSON.stringify(users));
	}

	userUpdate(user: IUser): Promise<void> {
		if (!this.db) {
			return Promise.reject(new Error("Database is not initialized"));
		}
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction('users', 'readwrite');
			const store = transaction.objectStore('users');

			// Check if the user exists
			const getRequest = store.get(user.id);

			getRequest.onsuccess = () => {
				if (getRequest.result) {
					// User exists, update it
					const updateRequest = store.put(user);
					updateRequest.onsuccess = () => {
						this.saveToFile(user); // Save to file
						resolve();
					};
					updateRequest.onerror = (event) => reject(event);
				} else {
					// User does not exist, create it
					const addRequest = store.add(user);
					addRequest.onsuccess = () => {
						this.saveToFile(user); // Save to file
						resolve();
					};
					addRequest.onerror = (event) => reject(event);
				}
			};

			getRequest.onerror = (event) => reject(event);
		});
	}

	getUser(username: string): Promise<IUser | null> {
		if (!this.db) {
			return Promise.reject(new Error("Database is not initialized"));
		}
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction('users', 'readonly');
			const store = transaction.objectStore('users');

			const request = store.index('username').get(username);

			request.onsuccess = (event) => {
				if (event.target) {
					const user = (event.target as IDBRequest).result;
					resolve(user ? user : null);
				} else {
					reject(new Error("Event target is null"));
				}
			};

			request.onerror = (event) => {
				reject(event);
			};
		});
	}
}

export default DatabaseUser;
export { DatabaseUser };
