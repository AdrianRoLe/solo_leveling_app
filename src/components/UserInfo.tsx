import { Button } from '@mui/material';
import React from 'react';
import { FaCog } from 'react-icons/fa';
import { APP_COLOR_ITEMS, COLOR_SCHEME_VALUES } from "../models/Constants.tsx";
import User from '../models/User.tsx';

const UserInfo = ({
	loggedInUser,
	colorScheme,
	calculateProgress,
	showSettingsModal,
	handleColorSchemeChange,
	handleLogout,
	setShowSettingsModal,
}: {
	loggedInUser: User;
	colorScheme: string;
	calculateProgress: (current_exp: number, exercises: any[]) => number;
	handleLogout: () => void;
	handleColorSchemeChange: (value: string) => void;
	showSettingsModal: boolean;
	setShowSettingsModal: (value: boolean) => void;
}) => {
	const applyColorScheme = COLOR_SCHEME_VALUES[colorScheme];

	return (<>
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				width: '100%',
				backgroundColor: applyColorScheme[APP_COLOR_ITEMS.SECONDARY],
				height: '30px',
				position: 'relative',
				marginBottom: '20px',
			}}
		>
			<div
				style={{
					width: `90%`,
					backgroundColor: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
					height: '100%',
					transition: 'width 0.3s ease-in-out',
				}}
			/>
			<span
				style={{
					position: 'absolute',
					top: '5px',
					left: '50%',
					transform: 'translateX(-50%)',
					fontWeight: 'bold',
					color: applyColorScheme[APP_COLOR_ITEMS.TERTIARY],
				}}
			>
				Level {loggedInUser.global_level}
			</span>
			<div
				style={{
					cursor: 'pointer',
					zIndex: 1000,
					marginRight: '10px',
					marginTop: '10px',
					marginBottom: '5px',
					background: `transparent`,
					border: 'none',
				}}
				onClick={() => setShowSettingsModal(true)}
			>
				<FaCog size={24} color={applyColorScheme[APP_COLOR_ITEMS.PRIMARY]} />
			</div>
		</div>

		{showSettingsModal && (
			<div style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000,
			}}>
				<div
					style={{
						backgroundColor: 'white',
						padding: '20px',
						borderRadius: '8px',
						textAlign: 'center',
						width: '300px',
						position: 'relative',
					}}
				>
					<h3>Settings</h3>
					<p>Choose a color scheme:</p>
					<select
						value={colorScheme}
						onChange={(e) => handleColorSchemeChange(e.target.value)}
						style={{
							padding: '10px',
							borderRadius: '5px',
							border: '1px solid #ccc',
							width: '100%',
						}}
					>
						{Object.keys(COLOR_SCHEME_VALUES).map((scheme) => (
							<option key={scheme} value={scheme}>
								{scheme.charAt(0).toUpperCase() + scheme.slice(1)}
							</option>
						))}
					</select>
					<div style={{ marginTop: '20px' }}>
						<Button
							variant="contained"
							onClick={() => setShowSettingsModal(false)}
							style={{
								backgroundColor: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
								color: applyColorScheme[APP_COLOR_ITEMS.SECONDARY],
							}}
						>
							Close
						</Button>
					</div>
					<Button
						variant="contained"
						onClick={handleLogout}
						style={{
							backgroundColor: applyColorScheme[APP_COLOR_ITEMS.TERTIARY],
							color: applyColorScheme[APP_COLOR_ITEMS.SECONDARY],
							position: 'absolute',
							bottom: '10px',
							right: '10px',
						}}
					>
						Logout
					</Button>
				</div>
			</div>
		)
		}
	</>)
};

export default UserInfo;
