import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import PubPreview from 'components/PubPreview/PubPreview';
import Footer from 'components/Footer/Footer';
import NoMatch from 'containers/NoMatch/NoMatch';
import { getCollectionData } from 'actions/collection';
import { Spinner } from '@blueprintjs/core';

require('./collection.scss');

const propTypes = {
	match: PropTypes.object.isRequired,
	appData: PropTypes.object.isRequired,
	collectionData: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

class Collection extends Component {
	componentWillMount() {
		this.dispatchGetCollectionData(this.props);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.match.params.slug !== this.props.match.params.slug) {
			this.dispatchGetCollectionData(nextProps);
		}
	}

	dispatchGetCollectionData(props) {
		// Currently, this has to wait until appData has been fetched and loaded before
		// even sending off the request. If we find this is slow, we can try sending
		// the slug (available from url immediately) to the API, and use the origin
		// to do a Community query to identify which communityId we need to restrict
		// by. This is all because collection slugs are not unique.
		if (props.appData.data) {
			const collectionId = props.appData.data.collections.reduce((prev, curr)=> {
				if (curr.slug === '' && props.match.params.slug === undefined) { return curr.id; }
				if (curr.slug === props.match.params.slug) { return curr.id; }
				return prev;
			}, undefined);
			if (collectionId) {
				this.props.dispatch(getCollectionData(collectionId));
			}
		}
	}

	render() {
		const collectionData = this.props.collectionData.data || {};
		const title = this.props.appData.data.collections.reduce((prev, curr)=> {
			if (curr.slug === '' && this.props.match.params.slug === undefined) { return curr.title; }
			if (curr.slug === this.props.match.params.slug) { return curr.title; }
			return prev;
		}, undefined);

		if (!title) { return <NoMatch />; }
		return (
			<div>
				<div className={'collection'}>
					<Helmet>
						<title>{title}</title>
					</Helmet>

					<div className={'container'}>
						<div className={'row'}>
							<div className={'col-12'}>
								<h1>{title}</h1>
							</div>
						</div>

						{!collectionData.id &&
							<div>
								<Spinner />
								{/* <div className={'row'}>
									<div className={'col-12'}>
										<PubPreview
											title={'Super Glue Data Engine'}
											description={'Media data accessible through APIs to build diverse applications'}
											slug={'my-article'}
											bannerImage={'/dev/banner1.jpg'}
											isLarge={true}
											publicationDate={String(new Date())}
											contributors={contributors}
											authors={authors}
										/>
									</div>
								</div>
								<div className={'row'}>
									<div className={'col-12'}>
										<PubPreview
											title={'Super Glue Data Engine'}
											description={'Media data accessible through APIs to build diverse applications'}
											slug={'my-article'}
											bannerImage={'/dev/banner1.jpg'}
											isLarge={false}
											publicationDate={String(new Date())}
											contributors={contributors}
											authors={authors}
										/>
									</div>
								</div>
								<div className={'row'}>
									<div className={'col-12'}>
										<PubPreview
											title={'Super Glue Data Engine'}
											description={'Media data accessible through APIs to build diverse applications'}
											slug={'my-article'}
											bannerImage={'/dev/banner2.jpg'}
											isLarge={false}
											publicationDate={String(new Date())}
											contributors={[]}
											authors={[authors[2]]}
										/>
									</div>
								</div> */}
							</div>
						}
						{!!collectionData.id &&
							<div>
								{collectionData.pubs.map((pub)=> {
									return (
										<div className={'row'} key={`pub-${pub.id}`}>
											<div className={'col-12'}>
												<PubPreview
													title={pub.title}
													description={pub.description}
													slug={pub.slug}
													bannerImage={`${pub.avatar}?rand=${Math.ceil(Math.random() * 10000)}`}
													isLarge={false}
													publicationDate={pub.updatedAt}
													contributors={[]}
													authors={pub.contributors}
												/>
											</div>
										</div>
									);
								})}
							</div>
						}
					</div>
				</div>

				{!this.props.collectionData.isLoading &&
					<Footer />
				}
				
			</div>
		);
	}
}

Collection.propTypes = propTypes;
export default withRouter(connect(state => ({ appData: state.app, collectionData: state.collection }))(Collection));
