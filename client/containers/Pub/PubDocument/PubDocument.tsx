import React, { useRef } from 'react';

import { usePageContext } from 'utils/hooks';
import { PubHistoryViewer } from 'components';
import {
	PubEdgeListing,
	Filter as PubEdgeFilter,
	Mode as PubEdgeMode,
} from 'components/PubEdgeListing';
import { useFacetsQuery } from 'client/utils/useFacets';

import { usePubContext } from '../pubHooks';
import { usePermalinkOnMount } from '../usePermalinkOnMount';
import { usePubHrefs } from '../usePubHrefs';
import PubBody from './PubBody';
import PubBottom from './PubBottom/PubBottom';
import PubFileImport from './PubFileImport';
import PubHeaderFormatting from './PubHeaderFormatting';
import PubHistoricalNotice from './PubHistoricalNotice';
import PubInlineMenu from './PubInlineMenu';
import PubInlineSuggestedEdits from './PubInlineSuggestedEdits';
import PubLinkController from './PubLinkController';
import PubMaintenanceNotice from './PubMaintenanceNotice';
import ContributorsListCondensed from '../../../components/ContributorsListCondensed/ContributorsListCondensed';
import { getAllPubContributors } from '../../../../utils/contributors';

require('./pubDocument.scss');

const PubDocument = () => {
	const {
		pubData,
		historyData,
		collabData,
		updatePubData,
		updateLocalData,
		pubBodyState: { isReadOnly, hidePubBody },
	} = usePubContext();
	const { isViewingHistory } = historyData;
	const { communityData, scopeData, featureFlags } = usePageContext();
	const pubEdgeDisplay = useFacetsQuery((F) => F.PubEdgeDisplay);
	const { canEdit, canEditDraft } = scopeData.activePermissions;
	const { isReviewingPub } = pubData;
	const mainContentRef = useRef<null | HTMLDivElement>(null);
	const sideContentRef = useRef(null);
	const editorWrapperRef = useRef(null);
	const contributors = getAllPubContributors(pubData, 'contributors');

	usePermalinkOnMount();
	usePubHrefs({ enabled: !isReadOnly });

	const showPubFileImport = (canEdit || canEditDraft) && !isReadOnly;

	if (hidePubBody) {
		return null;
	}

	return (
		<div className="pub-document-component">
			{(!isReadOnly || isViewingHistory) && (
				<PubHeaderFormatting
					disabled={isViewingHistory}
					editorWrapperRef={editorWrapperRef}
				/>
			)}
			<div className="pub-grid">
				<div className="main-content" ref={mainContentRef}>
					<PubMaintenanceNotice pubData={pubData} />
					{!isReviewingPub && (
						<PubHistoricalNotice pubData={pubData} historyData={historyData} />
					)}
					<PubEdgeListing
						className="top-pub-edges"
						pubData={pubData}
						pubEdgeDescriptionIsVisible={pubEdgeDisplay.descriptionIsVisible}
						accentColor={communityData.accentColorDark}
						initialFilters={[PubEdgeFilter.Parent]}
						isolated
					/>
					<PubBody editorWrapperRef={editorWrapperRef} />
					{showPubFileImport && (
						<PubFileImport
							editorChangeObject={collabData.editorChangeObject!}
							updatePubData={updatePubData}
						/>
					)}
					{!isViewingHistory && <PubInlineMenu />}
					{featureFlags.suggestedEdits && !isViewingHistory && (
						<PubInlineSuggestedEdits />
					)}
					{featureFlags.bodyContributors && (
						<div className="body-contributors">
							<h5 className="body-contributors-header">
								Contributors
								<br />
								(A–Z)
							</h5>
							<ContributorsListCondensed attributions={contributors} />
						</div>
					)}
					<PubEdgeListing
						className="bottom-pub-edges"
						pubData={pubData}
						pubEdgeDescriptionIsVisible={pubEdgeDisplay.descriptionIsVisible}
						accentColor={communityData.accentColorDark}
						initialFilters={[PubEdgeFilter.Child, PubEdgeFilter.Sibling]}
						initialMode={
							pubEdgeDisplay.defaultsToCarousel
								? PubEdgeMode.Carousel
								: PubEdgeMode.List
						}
					/>
				</div>
				<div className="side-content" ref={sideContentRef}>
					{isViewingHistory && !isReviewingPub && (
						<PubHistoryViewer
							historyData={historyData}
							pubData={pubData}
							onClose={() => historyData.setIsViewingHistory(false)}
							onSetCurrentHistoryKey={historyData.setCurrentHistoryKey}
						/>
					)}
				</div>
			</div>
			<PubBottom
				pubData={pubData}
				updateLocalData={updateLocalData}
				sideContentRef={sideContentRef}
				mainContentRef={mainContentRef}
			/>
			<PubLinkController mainContentRef={mainContentRef} />
		</div>
	);
};

export default PubDocument;
