import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import DocumentMeta from 'react-document-meta';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {getPub} from '../../actions/reader';
import {PubBody, PubDiscussion} from '../../components';
import {globalStyles} from '../../utils/styleConstants';

let styles = {};
let leftBarStyles = {};
let rightBarStyles = {};

const Reader = React.createClass({
	propTypes: {
		readerData: PropTypes.object,
		slug: PropTypes.string,
		dispatch: PropTypes.func
	},
	mixins: [PureRenderMixin],

	statics: {
		fetchDataDeferred: function(getState, dispatch, location, routeParams) {
			return dispatch(getPub(routeParams.slug));
		}
	},

	loader: function() {
		return {
			transform: 'translateX(' + (-100 + this.props.readerData.get('loading')) + '%)',
			transition: '.2s linear transform'
		};
	},

	pubNavClick: function(optionClicked) {
		console.log(optionClicked);
	},

	calculateReviewScores: function(reviews) {
		return (<div>Hi!</div>);
	},

	render: function() {
		const metaData = {};
		if (this.props.readerData.getIn(['pubData', 'title'])) {
			metaData.title = 'PubPub - ' + this.props.readerData.getIn(['pubData', 'title']);
		} else {
			metaData.title = 'PubPub - ' + this.props.slug;
		}
		
		const pubData = this.props.readerData.get('pubData').toJS();
		console.log(pubData);
		return (
			<div style={styles.container}>

				<DocumentMeta {...metaData} />

				<div className="leftBar" style={[styles.leftBar, styles[this.props.readerData.get('status')]]}>
					
					<div style={leftBarStyles.detail}>Home</div>
					<div style={leftBarStyles.detail}>Explore Pubs (2,342)</div>
					<div style={leftBarStyles.detail}>Collections (31)</div>
					<div style={leftBarStyles.detail}>Share</div>

					<div style={leftBarStyles.leftBarDivider}></div>

					<div style={leftBarStyles.detail}>Share</div>
					<div style={leftBarStyles.detail}>Views: {pubData.views}</div>
					<div style={leftBarStyles.detail}>Citations: {pubData.citations}</div>
					<div style={leftBarStyles.detail}>In the News: {pubData.inTheNews}</div>
					<div style={leftBarStyles.detail}>View All Analytics</div>

					<div style={leftBarStyles.leftBarDivider}></div>

					<div style={leftBarStyles.header}>Read Next</div>
					{
						pubData.readNext.map((relatedPub)=>{
							return <div key={'leftbar_' + relatedPub.title} style={leftBarStyles.pub}>{relatedPub.title}</div>;
						})
					}

				</div>

				<div className="centerBar" style={styles.centerBar}>
					<PubBody
						status = {this.props.readerData.get('status')}
						navClickFunction = {this.pubNavClick}
						title = {pubData.title} 
						abstract = {pubData.abstract} 
						markdown = {pubData.markdown}
						authors = {pubData.authors}/>

				</div>

				<div className="rightBar" style={[styles.rightBar, styles[this.props.readerData.get('status')]]}>
					<div className="pub-status-wrapper" style={rightBarStyles.sectionWrapper}>
						<div style={rightBarStyles.sectionHeader}>{pubData.status}</div>
						<div style={rightBarStyles.sectionSubHeader}>Featured in {pubData.featuredIn.length}  |  Submitted to {pubData.submittedTo.length}</div>
					</div>
					<div className="pub-reviews-wrapper" style={rightBarStyles.sectionWrapper}>

						<div style={rightBarStyles.sectionHeader}>Peer Reviews ({pubData.reviews.length})</div>
						<div style={rightBarStyles.sectionSubHeader}>
							Full Details | Submit Review | View Experts ({pubData.experts.length}) | Suggest Experts
						</div>
						<div style={rightBarStyles.reviewsWrapper}>
							{this.calculateReviewScores(pubData.reviews)}
						</div>
						
					</div>
					<div className="pub-discussions-wrapper" style={rightBarStyles.sectionWrapper}>
						<div style={rightBarStyles.sectionHeader}>Discussion</div>
						{
							pubData.discussions.map((discussion)=>{
								return <PubDiscussion key={discussion._id} discussionItem={discussion}/>;
							})
						}
					</div>
				</div>
				
			</div>
		);
	}

});

export default connect( state => {
	return {readerData: state.reader, slug: state.router.params.slug};
})( Radium(Reader) );

const pubSizes = {
	mobileLeft: null,
	mobilePub: '100%',
	mobileRight: null,
	mobileMinContainer: null,
	mobileMaxContainer: '767px',

	xSmallLeft: 0,
	xSmallPub: 600,
	xSmallRight: 'calc(100% -  600px)',
	xSmallPadding: 5,
	xSmallMinContainer: 768,
	xSmallMaxContainer: 1023,

	smallLeft: 150,
	smallPub: 650,
	smallRight: 'calc(100% -  800px)',
	smallPadding: 10,
	smallMinContainer: 1024,
	smallMaxContainer: 1300,

	mediumLeft: 150,
	mediumPub: 750,
	mediumRight: 'calc(100% -  900px)',
	mediumPadding: 15,
	mediumMinContainer: 1301,
	mediumMaxContainer: 1600,

	largeLeft: 200,
	largePub: 950,
	largeRight: 'calc(100% -  1150px)',
	largePadding: 20,
	largeMinContainer: 1601,
	largeMaxContainer: 2000,

	xLargeLeft: 200,
	xLargePub: 1250,
	xLargeRight: 'calc(100% -  1450px)',
	xLargePadding: 25,
	xLargeMinContainer: 2001,
	xLargeMaxContainer: 2600,

};

styles = {
	container: {
		width: '100%',
		height: 'calc(100vh - ' + globalStyles.headerHeight + ')',
		backgroundColor: globalStyles.sideBackground,
		// Mobile
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			width: '100%',
			maxWidth: '100%',
			height: 'auto'
		},
		// Desktop Sizes
		'@media screen and (min-width: 768px) and (max-width: 1023px)': {
			// backgroundColor: 'red',
		},
		'@media screen and (min-width: 1024px) and (max-width: 1300px)': {
			// backgroundColor: 'orange',
		},
		'@media screen and (min-width: 1301px) and (max-width: 1600px)': {
			// backgroundColor: 'yellow',
		},
		'@media screen and (min-width: 1600px) and (max-width: 2000px)': {
			// backgroundColor: 'green',
		},
		'@media screen and (min-width: 2000px)': {
			// backgroundColor: 'blue',
		},

	},
	leftBar: {
		padding: 5,
		width: 'calc(150px - 10px)',
		height: 'calc(100vh - ' + globalStyles.headerHeight + ' - 10px)',
		marginRight: 650,
		float: 'left',
		transition: '.3s linear opacity .25s',
		overflow: 'hidden',
		overflowY: 'scroll',
		fontFamily: 'Lato',
		color: globalStyles.sideText,
		// Mobile
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			display: 'none',
		},
		// Desktop Sizes
		'@media screen and (min-width: 768px) and (max-width: 1023px)': {
			padding: 0,
			width: 'calc(' + pubSizes.xSmallLeft + 'px - ' + (2 * pubSizes.xSmallPadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.xSmallPadding) + 'px)',
			marginRight: pubSizes.xSmallPub
		},
		'@media screen and (min-width: 1024px) and (max-width: 1300px)': {
			padding: pubSizes.smallPadding,
			width: 'calc(' + pubSizes.smallLeft + 'px - ' + (2 * pubSizes.smallPadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.smallPadding) + 'px)',
			marginRight: pubSizes.smallPub
		},
		'@media screen and (min-width: 1301px) and (max-width: 1600px)': {
			padding: pubSizes.mediumPadding,
			width: 'calc(' + pubSizes.mediumLeft + 'px - ' + (2 * pubSizes.mediumPadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.mediumPadding) + 'px)',
			marginRight: pubSizes.mediumPub
		},
		'@media screen and (min-width: 1600px) and (max-width: 2000px)': {
			padding: pubSizes.largePadding,
			width: 'calc(' + pubSizes.largeLeft + 'px - ' + (2 * pubSizes.largePadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.largePadding) + 'px)',
			marginRight: pubSizes.largePub
		},
		'@media screen and (min-width: 2000px)': {
			padding: pubSizes.xLargePadding,
			width: 'calc(' + pubSizes.xLargeLeft + 'px - ' + (2 * pubSizes.xLargePadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.xLargePadding) + 'px)',
			marginRight: pubSizes.xLargePub
		},
		
		
	},

	centerBar: {
		width: 650,
		height: 'calc(100vh - ' + globalStyles.headerHeight + ' + 3px)',
		position: 'absolute',
		top: '-3px',
		left: 150,
		float: 'left',
		overflow: 'hidden',
		overflowY: 'scroll',
		boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.4)',
		zIndex: 10,
		// Mobile
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			width: '100%',
			// height: 'calc(100vh - ' + globalStyles.headerHeight + ')',
			height: 'auto',
			position: 'relative',
			overflow: 'hidden',
			float: 'none',
			zIndex: 0,
			top: 0,
			left: 0,
		},
		// Desktop Sizes
		'@media screen and (min-width: 768px) and (max-width: 1023px)': {
			width: pubSizes.xSmallPub,
			left: pubSizes.xSmallLeft,
		},
		'@media screen and (min-width: 1024px) and (max-width: 1300px)': {
			width: pubSizes.smallPub,
			left: pubSizes.smallLeft,
		},
		'@media screen and (min-width: 1301px) and (max-width: 1600px)': {
			width: pubSizes.mediumPub,
			left: pubSizes.mediumLeft,
		},
		'@media screen and (min-width: 1600px) and (max-width: 2000px)': {
			width: pubSizes.largePub,
			left: pubSizes.largeLeft,
		},
		'@media screen and (min-width: 2000px)': {
			width: pubSizes.xLargePub,
			left: pubSizes.xLargeLeft,
		},
	},

	rightBar: {
		padding: 5,
		width: 'calc(100% - 800px - 10px)',
		height: 'calc(100vh - ' + globalStyles.headerHeight + ' - 10px)',
		float: 'left',
		overflow: 'hidden',
		overflowY: 'scroll',
		fontFamily: 'Lato',
		transition: '.3s linear opacity .25s',
		// Mobile
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			display: 'none',
		},
		// Desktop Sizes
		'@media screen and (min-width: 768px) and (max-width: 1023px)': {
			padding: pubSizes.xSmallPadding,
			width: 'calc(100% - ' + pubSizes.xSmallLeft + 'px - ' + pubSizes.xSmallPub + 'px - ' + (2 * pubSizes.xSmallPadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.xSmallPadding) + 'px)',
		},
		'@media screen and (min-width: 1024px) and (max-width: 1300px)': {
			padding: pubSizes.smallPadding,
			width: 'calc(100% - ' + pubSizes.smallLeft + 'px - ' + pubSizes.smallPub + 'px - ' + (2 * pubSizes.smallPadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.smallPadding) + 'px)',
		},
		'@media screen and (min-width: 1301px) and (max-width: 1600px)': {
			padding: pubSizes.mediumPadding,
			width: 'calc(100% - ' + pubSizes.mediumLeft + 'px - ' + pubSizes.mediumPub + 'px - ' + (2 * pubSizes.mediumPadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.mediumPadding) + 'px)',
		},
		'@media screen and (min-width: 1600px) and (max-width: 2000px)': {
			padding: pubSizes.largePadding,
			width: 'calc(100% - ' + pubSizes.largeLeft + 'px - ' + pubSizes.largePub + 'px - ' + (2 * pubSizes.largePadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.largePadding) + 'px)',
		},
		'@media screen and (min-width: 2000px)': {
			padding: pubSizes.xLargePadding,
			width: 'calc(100% - ' + pubSizes.xLargeLeft + 'px - ' + pubSizes.xLargePub + 'px - ' + (2 * pubSizes.xLargePadding) + 'px)',
			height: 'calc(100vh - ' + globalStyles.headerHeight + ' - ' + (2 * pubSizes.xLargePadding) + 'px)',
		},
	},
	loading: {
		opacity: 0,
	}, 
	loaded: {
		opacity: 1
	},
};

leftBarStyles = {
	journalText: {
		padding: '15px 5px',
		fontSize: '13px',
	},
	detail: {
		fontSize: '13px',
		padding: '8px 0px',
	},
	leftBarDivider: {
		backgroundColor: '#DDD',
		width: '80%',
		height: 1,
		margin: '15px auto',
	},
	header: {
		margin: '8px 0px',
	},
	pub: {
		margin: '15px 0px 15px 8px',
		fontSize: '13px',
	}
};

rightBarStyles = {
	sectionWrapper: {
		margin: '20px 0px',
	},
	sectionHeader: {
		fontSize: '25px',
		color: '#666',
		margin: 0,
		padding: 0,
		width: '100%',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',

	},
	sectionSubHeader: {
		margin: '3px 0px',
		fontSize: '14px',
		color: '#777',
		width: '100%',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	reviewsWrapper: {

	}
};
