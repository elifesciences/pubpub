import React from 'react';
import PropTypes from 'prop-types';

import { usePageContext } from 'utils/hooks';

import Notes, { notePropType } from './Notes';
import PubBottomSection, { SectionBullets } from './PubBottomSection';

const propTypes = {
	items: PropTypes.arrayOf(notePropType).isRequired,
	nodeType: PropTypes.string.isRequired,
	viewNode: PropTypes.object,
};

const defaultProps = {
	viewNode: null,
};

const SearchableNoteSection = (props) => {
	const { items, nodeType, viewNode, ...restProps } = props;
	const numberedItems = items.map((item, index) => ({ ...item, number: index + 1 }));
	const { communityData } = usePageContext();

	return (
		<PubBottomSection
			accentColor={communityData.accentColorDark}
			isSearchable={true}
			centerItems={<SectionBullets>{items.length}</SectionBullets>}
			{...restProps}
		>
			{({ searchTerm }) => (
				<Notes
					accentColor={communityData.accentColorDark}
					notes={numberedItems.filter(
						(fn) =>
							!searchTerm ||
							[fn.html, fn.unstructuredValue]
								.filter((x) => x)
								.map((source) => source.toLowerCase())
								.some((source) => source.includes(searchTerm.toLowerCase())),
					)}
				/>
			)}
		</PubBottomSection>
	);
};

SearchableNoteSection.propTypes = propTypes;
SearchableNoteSection.defaultProps = defaultProps;
export default SearchableNoteSection;
