import Button from '@mui/material/Button';
import React from 'react';
import { APP_COLOR_ITEMS, COLOR_SCHEME_VALUES } from "../models/Constants.tsx";
import { IExercise } from '../models/Interfaces.tsx';

const UserExercises = ({
	exercises,
	colorScheme,
	calculateExpBG,
	handleIncreaseWeight,
	openDeleteModal,
}: {
	exercises: IExercise[];
	colorScheme: string;
	calculateExpBG: (exp: number, level: number, startWeight: number, currentWeight: number) => string;
	handleIncreaseWeight: (index: number) => void;
	openDeleteModal: (index: number) => void;
}) => {
	const applyColorScheme = COLOR_SCHEME_VALUES[colorScheme];

	return (
		<ul
			style={{
				listStyleType: 'none',
				padding: 0,
				width: '100%',
			}}
		>
			{exercises.map((exercise, index) => (
				<li
					key={index}
					style={{
						margin: '10px 0',
						padding: '10px',
						position: 'relative',
						borderRadius: '8px',
						overflow: 'hidden',
						color: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
						fontWeight: 'bold',
						backgroundColor: applyColorScheme[APP_COLOR_ITEMS.SECONDARY],
						textAlign: 'center',
					}}
				>
					{/* Background layer for the level */}
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '5em',
							fontWeight: 'bold',
							color: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
							zIndex: 1,
						}}
					>
						{exercise.level}
					</div>
					{/* Gradient layer */}
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: calculateExpBG(
								exercise.exp,
								exercise.level,
								exercise.start_weight,
								exercise.current_weight
							),
							height: '100%',
							zIndex: 2,
							opacity: 0.5,
							background: `linear-gradient(to right, ${applyColorScheme[APP_COLOR_ITEMS.GRADIENT_START]}, ${applyColorScheme[APP_COLOR_ITEMS.GRADIENT_END]})`,
							transition: 'width 0.3s ease-in-out',
						}}
					/>
					{/* Content layer */}
					<div
						style={{
							position: 'relative',
							zIndex: 3,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<div>
							<h3 style={{ margin: 0 }}>{exercise.name}</h3>
							<p style={{ margin: 0, fontSize: '0.9em' }}>{exercise.category}</p>
						</div>
						<div style={{ textAlign: 'right' }}>
							<p style={{ margin: 0, marginRight: '10px', fontWeight: 'bold', fontSize: '1.2em' }}>
								{exercise.current_weight} kg
							</p>
							<Button
								variant="contained"
								onClick={() => handleIncreaseWeight(index)}
								style={{
									backgroundColor: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
									color: applyColorScheme[APP_COLOR_ITEMS.SECONDARY],
									minWidth: '30px',
									height: '30px',
									fontWeight: 'bold',
									marginRight: '10px',
								}}
							>
								+
							</Button>
							<Button
								variant="outlined"
								onClick={() => openDeleteModal(index)}
								style={{
									color: applyColorScheme[APP_COLOR_ITEMS.TERTIARY],
									borderColor: applyColorScheme[APP_COLOR_ITEMS.TERTIARY],
									minWidth: '30px',
									height: '30px',
								}}
							>
								*
							</Button>
							<p style={{ margin: 0, marginRight: '10px', fontSize: '0.8em' }}>
								(from {exercise.start_weight} kg)
							</p>
						</div>
					</div>
				</li>
			))}
		</ul>
	);
};

export default UserExercises;
