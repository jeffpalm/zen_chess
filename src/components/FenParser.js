import React from 'react';

const FenParser = props => {
	let output = [];
	const { fen } = props;
	const pieces = fen.substring(0, fen.indexOf(' '));
	pieces.split('').map((e, i) => {
		if (parseInt(e)) {
			for (let j = 0; j < parseInt(e); j++) {
				output.push('');
			}
		} else if (e !== '/') {
			output.push(e);
		}
	});
	return output;
};

export default FenParser;
