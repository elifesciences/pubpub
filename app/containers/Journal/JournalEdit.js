import React, { PropTypes } from 'react';
import Radium, { Style } from 'radium';
import Helmet from 'react-helmet';
import { ImageUpload, Loader } from 'components';
import { s3Upload } from 'utils/uploadFile';
import { RadioGroup, Radio } from '@blueprintjs/core';
import { ChromePicker } from 'react-color';

import { globalStyles } from 'utils/globalStyles';
import { globalMessages } from 'utils/globalMessages';
import { FormattedMessage } from 'react-intl';

import { putJournal } from './actions';

let styles = {};

export const JournalEdit = React.createClass({
	propTypes: {
		journal: PropTypes.object,
		handleHeaderUpdate: PropTypes.func,
		isLoading: PropTypes.bool,
		error: PropTypes.string,
		dispatch: PropTypes.func,
	},

	getInitialState: function() {
		return {
			logo: undefined,
			headerColor: '',
			headerMode: '',
			headerAlign: '',
			headerImage: null,
			icon: undefined,
			name: '',
			shortDescription: '',
		};
	},

	componentWillMount() {
		const journal = this.props.journal || {};
		this.initialize(journal);
	},
	
	componentWillReceiveProps(nextProps) {
		const journal = nextProps.journal || {};
		// this.initialize(journal);

		// If the slug changed, redirect to new slug.
		const lastSlug = this.props.journal.slug;
		const nextSlug = nextProps.journal.slug;
		if (lastSlug && nextSlug && lastSlug !== nextSlug) {
			browserHistory.push('/' + nextSlug + '/details');
		}
	},

	initialize: function(journal) {
		// Initialize data once we have it.
		if (journal.id && this.state.icon === undefined) {
			this.setState({
				slug: journal.slug || '',
				name: journal.name || '',
				icon: journal.icon || 'https://assets.pubpub.org/_site/journal.png',
				shortDescription: journal.shortDescription || '',
				headerColor: journal.headerColor || '#13A6EF',
				headerMode: journal.headerMode || 'title',
				headerAlign: journal.headerAlign || 'left',
				headerImage: journal.headerImage,
				website: journal.website || '',
				twitter: journal.twitter || '',
				facebook: journal.facebook || '',
			});
		}
	},

	componentWillUnmount() {
		this.props.handleHeaderUpdate({
			logo: undefined,
			headerColor: undefined,
			headerMode: undefined,
			headerAlign: undefined,
			headerImage: undefined,
		});
	},

	

	onHeaderImageFinish: function(evt, index, type, filename) {
		this.setState({ headerImage: 'https://assets.pubpub.org/' + filename });
		this.props.handleHeaderUpdate({ headerImage: 'https://assets.pubpub.org/' + filename });
	},
	clearHeaderImageFinish: function() {
		this.setState({ headerImage: null });
		this.props.handleHeaderUpdate({ headerImage: null });
	},

	handleColorChange: function(colorChange) {
		this.setState({ headerColor: colorChange.hex });
		this.props.handleHeaderUpdate({ headerColor: colorChange.hex });
	},
	handleHeaderModeChange: function(value, evt) {
		evt.preventDefault();
		const newHeaderMode = value;
		this.setState({ headerMode: newHeaderMode });
		this.props.handleHeaderUpdate({ headerMode: newHeaderMode });
	},

	handleHeaderAlignChange: function(value, evt) {
		evt.preventDefault();
		const newHeaderAlign = value;
		this.setState({ headerAlign: newHeaderAlign });
		this.props.handleHeaderUpdate({ headerAlign: newHeaderAlign });
	},

	inputUpdate: function(key, evt) {
		const value = evt.target.value || '';
		this.setState({ [key]: value });
	},

	inputUpdateLowerCase: function(key, evt) {
		const value = evt.target.value || '';
		this.setState({ [key]: value.toLowerCase() });
	},

	shortDescriptionUpdate: function(evt) {
		const description = evt.target.value || '';
		this.setState({ shortDescription: description.substring(0, 140) });
	},

	saveJournal: function(evt) {
		evt.preventDefault();

		const newJournalData = {};
		Object.keys(this.state).map((key)=> {
			if (this.state[key]) {
				newJournalData[key] = this.state[key];
			}
		});

		this.props.dispatch(putJournal(this.props.journal.id, newJournalData));
	},
	handleIconFinish: function(imageUrl) {
		this.setState({ icon: imageUrl });
	},

	render: function() {
		const journal = this.props.journal || {};

		const metaData = {
			title: 'Edit · ' + journal.name,
		};

		const isLoading = this.props.isLoading;
		const errorMessage = this.props.error;

		return (
			<div>
				<Helmet {...metaData} />

				<Style rules={{
					'.colorPicker': { margin: '1em 0.5em', },
					'.colorPicker > div': { boxShadow: '0px 0px 0px black !important', border: '1px solid #BBBDC0 !important' },
				}} />

				<form onSubmit={this.saveLayout} style={styles.form}>
					<div style={styles.buttonWrapper}>
						<button className={'pt-button pt-intent-primary'} onClick={this.saveLayout}>
							<FormattedMessage {...globalMessages.SaveLayout} />
						</button>

						<div style={styles.loaderContainer}><Loader loading={isLoading} showCompletion={!errorMessage} /></div>

						<div style={styles.errorMessage}>{errorMessage}</div>
					</div>

					<div style={styles.formContentWrapper}>
						

						<label style={styles.label} htmlFor={'name'}>
							<FormattedMessage {...globalMessages.JournalName} />
							<input className={'pt-input margin-bottom'} id={'name'} name={'name'} type="text" style={styles.input} value={this.state.name} onChange={this.inputUpdate.bind(this, 'name')} />
						</label>

						<label style={styles.label} htmlFor={'slug'}>
							<FormattedMessage {...globalMessages.JournalURL} />
							<input className={'pt-input margin-bottom'} id={'slug'} name={'slug'} type="text" style={styles.input} value={this.state.slug} onChange={this.inputUpdate.bind(this, 'slug')} />
						</label>

						<label style={styles.label} htmlFor={'shortDescription'}>
							Short Description
							<textarea className={'pt-input margin-bottom'} id={'shortDescription'} name={'shortDescription'} type="text" style={[styles.input, styles.textarea]} onChange={this.shortDescriptionUpdate} value={this.state.shortDescription} />
							<div className={'light-color inputSubtext'}>
								{this.state.shortDescription.length} / 140
							</div>
						</label>

						<ImageUpload 
							defaultImage={this.state.icon}
							userCrop={true}
							label={<FormattedMessage {...globalMessages.JournalIcon} />}
							tooltip={<FormattedMessage id="JournalProfileEdit.journalIconDescription" defaultMessage="Used as the Journal's preview image in search results and throughout the site."/>} 
							containerStyle={styles.imageContainer}
							onNewImage={this.handleIconFinish} />


						<label style={styles.label} htmlFor={'website'}>
							<FormattedMessage {...globalMessages.Website}/>
							<input className={'pt-input margin-bottom'} id={'website'} name={'website'} type="text" style={styles.input} value={this.state.website} onChange={this.inputUpdate.bind(this, 'website')} />
						</label>

						<label htmlFor={'twitter'}>
							Twitter
							<div className="pt-control-group prefixed-group margin-bottom">
								<div className={'pt-button pt-disabled input-prefix'}>@</div>
								<input className={'pt-input prefixed-input'} id={'twitter'} name={'twitter'} type="text" style={styles.input} value={this.state.twitter} onChange={this.inputUpdate.bind(this, 'twitter')} />
							</div>
						</label>

						<label htmlFor={'facebook'}>
							Facebook
							<div className="pt-control-group prefixed-group margin-bottom">
								<div className={'pt-button pt-disabled input-prefix'}>facebook.com/</div>
								<input className={'pt-input prefixed-input'} id={'facebook'} name={'facebook'} type="text" style={styles.input} value={this.state.facebook} onChange={this.inputUpdate.bind(this, 'facebook')} />
							</div>
						</label>



						<ImageUpload 
							defaultImage={journal.logo}
							userCrop={false}
							label={'Logo'}
							tooltip={'Used in the Header bar for all branded Journal pages'} 
							containerStyle={styles.imageContainer}
							onNewImage={this.handleLogoFinish} />


						<ImageUpload 
							defaultImage={this.state.headerImage}
							userCrop={false}
							label={'Background Image'}
							tooltip={'Testing Tooltip layout'} 
							containerStyle={styles.imageContainer}
							onNewImage={this.handleHeaderImageFinish} />

						<label htmlFor={'headerMode'}>
							<FormattedMessage {...globalMessages.HeaderMode} />

							<div style={{margin:'1em'}} className={'pt-button-group'}>
								<button className={this.state.headerMode === 'title' ? 'pt-button pt-active' : 'pt-button'} onClick={this.handleHeaderModeChange.bind(this, 'title')}>Title</button>
								<button className={this.state.headerMode === 'logo' ? 'pt-button pt-active' : 'pt-button'} onClick={this.handleHeaderModeChange.bind(this, 'logo')}>Logo</button>
								<button className={this.state.headerMode === 'both' ? 'pt-button pt-active' : 'pt-button'} onClick={this.handleHeaderModeChange.bind(this, 'both')}>Both</button>
							</div>
						</label>
						{/*<RadioGroup name="header mode" selectedValue={this.state.headerMode} onChange={this.handleHeaderModeChange}>
							<Radio value="title" style={styles.radioInput} label={<FormattedMessage {...globalMessages.Title} />} />
							<Radio value="logo" style={styles.radioInput} label={<FormattedMessage {...globalMessages.Logo} />} />
							<Radio value="both" style={styles.radioInput} label={<FormattedMessage {...globalMessages.Both} />} />
						</RadioGroup>*/}

						<label htmlFor={'headerAlign'}>
							<FormattedMessage {...globalMessages.HeaderAlign} />
							<div style={{margin:'1em'}} className={'pt-button-group'}>
								<button className={this.state.headerMode === 'left' ? 'pt-button pt-active' : 'pt-button'} onClick={this.handleHeaderAlignChange.bind(this, 'left')}>Left</button>
								<button className={this.state.headerMode === 'center' ? 'pt-button pt-active' : 'pt-button'} onClick={this.handleHeaderAlignChange.bind(this, 'center')}>Center</button>
							</div>
						</label>
						{/*<RadioGroup name="header align" selectedValue={this.state.headerAlign} onChange={this.handleHeaderAlignChange}>
							<Radio value="left" style={styles.radioInput} label={<FormattedMessage {...globalMessages.Left} />} /> 
							<Radio value="center" style={styles.radioInput} label={<FormattedMessage {...globalMessages.Center} />} /> 
						</RadioGroup>*/}

						<label>
							<FormattedMessage {...globalMessages.BackgroundColor} />
							<div className={'colorPicker'}>
								<ChromePicker color={this.state.headerColor} disableAlpha={true} onChange={this.handleColorChange} />
							</div>
						</label>
							


						{/*<div>
							<label htmlFor={'headerImage'}>
								<FormattedMessage {...globalMessages.BackgroundImage} />
							</label>
							{this.state.headerImage &&
								<img style={styles.image} src={'https://jake.pubpub.org/unsafe/fit-in/500x0/' + this.state.headerImage} />
							}
							<input id={'headerImage'} name={'background image'} type="file" accept="image/*" onChange={this.handleHeaderImageSelect} />
							<div className={'light-color inputSubtext underlineOnHover'} onClick={this.clearHeaderImageFinish} style={[styles.clear, !this.state.headerImage && {display: 'none'}]}>
								<FormattedMessage {...globalMessages.Clear} />
							</div>

						</div>*/}
					</div>



				</form>

			</div>
		);
	}

});

export default Radium(JournalEdit);

styles = {
	form: {
		// width: '500px',
		// position: 'relative',
		// '@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
		// 	width: 'auto',
		// }
	},
	buttonWrapper: {
		float: 'right',
	},
	formContentWrapper: {
		width: '500px',
		position: 'relative',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			width: 'auto',
		}
	},
	imageContainer: {
		marginRight: '3em',
	},
	input: {
		width: 'calc(100% - 20px)', // Calculations come from padding and border
	},
	image: {
		maxWidth: '100%',
	},

	loaderContainer: {
		display: 'inline-block',
		position: 'relative',
		top: 15,
	},
	errorMessage: {
		padding: '10px 0px',
		color: globalStyles.errorRed,
	},
	radioInput: {
		margin: '0em 1em', 
		display: 'inline-block',
	},
	clear: {
		cursor: 'pointer',
	},
};
