import React, {PropTypes} from 'react';
import Radium from 'radium';
import { ImageCropper } from 'components';
import { s3Upload } from 'utils/uploadFile';
import { Spinner, Tooltip, Position } from '@blueprintjs/core';

let styles = {};

export const ImageUpload = React.createClass({
	propTypes: {
		defaultImage: PropTypes.string,
		userCrop: PropTypes.bool,
		width: PropTypes.number,
		label: PropTypes.node,
		tooltip: PropTypes.node,
		containerStyle: PropTypes.object,
		onNewImage: PropTypes.func,
	},

	getInitialState() {
		return {
			defaultImage: undefined,
			uploading: false, // When uploading to server
			imageFile: null,
			imageURL: undefined,
			loadingImage: false, // When loading into DOM
		};
	},

	componentWillMount() {
		this.setState({ defaultImage: this.props.defaultImage });
	},

	componentWillReceiveProps(nextProps) {
		if (nextProps.defaultImage !== this.props.defaultImage) {
			this.setState({ defaultImage: nextProps.defaultImage });
		}
	},

	handleImageSelect: function(evt) {
		if (evt.target.files.length && this.props.userCrop) {
			this.setState({ imageFile: evt.target.files[0] });	
		}

		if (evt.target.files.length && !this.props.userCrop) {
			s3Upload(evt.target.files[0], ()=>{}, this.onUploadFinish, 0);
			this.setState({ 
				uploading: true,
				loadingImage: true, 
			});
		}

	},

	onUploadFinish: function(evt, index, type, filename) {
		this.setState({ 
			imageURL: 'https://assets.pubpub.org/' + filename,
			uploading: false, 
			loadingImage: true,
		});
	},

	cancelImageUpload: function() {
		this.setState({ 
			imageFile: null,
			uploading: false, 
		});
	},

	imageUploaded: function(url) {
		this.setState({ 
			imageFile: null, 
			imageURL: url,
			uploading: false,
			loadingImage: true,
		});
	},

	onImageRender: function() {
		this.setState({
			loadingImage: false,
		});
		this.props.onNewImage(this.state.imageURL);
	},

	onImageError: function() {
		console.log('Image error. Please retry');
		this.setState({
			uploading: false,
			imageFile: null,
			imageURL: undefined,
			loadingImage: false, 
		});
	},

	render: function() {
		const width = (this.props.width || 75);
		// const imageDimensions = { width: width, maxHeight: width };
		const imageDimensions = { maxWidth: '30vw', height: width };
		const containerStyle = this.props.containerStyle || {};
		return (
				
			<div style={[styles.container, containerStyle]}>
				<Tooltip content={<span style={styles.tooltipText}>{this.props.tooltip}</span>} position={Position.TOP_LEFT}>
					<label htmlFor={'logo'}>
						<div style={styles.label}>
							{this.props.label}
						</div>
						
						
						<div className={'showChildOnHover'} style={{position: 'relative'}}>
							<img style={imageDimensions} src={(this.state.imageURL || this.props.defaultImage)} onLoad={this.onImageRender} onError={this.onImageError}/>		
							<a role="button" className={'pt-button pt-icon-edit'} style={styles.editButton} />
							
							{this.state.loadingImage &&
								<div style={styles.loader}>
									<Spinner className={'pt-small'} />	
								</div>
							}
							
						</div>
						
						{!this.state.loadingImage &&
							<input id={'logo'} name={'logo image'} type="file" accept="image/*" onChange={this.handleImageSelect} style={{ position: 'fixed', top: '-100px' }}/>
						}

						
						
					</label>
				</Tooltip>
				<div style={[styles.imageCropperWrapper, this.state.imageFile !== null && styles.imageCropperWrapperVisible]} >
					<div style={styles.imageCropper}>
						<ImageCropper height={500} width={500} image={this.state.imageFile} onCancel={this.cancelImageUpload} onUpload={this.imageUploaded}/>
					</div>
				</div>
			</div>
		);
	}
});

export default Radium(ImageUpload);

styles = {
	container: {
		position: 'relative',
		display: 'inline-block',
	},
	label: {
		paddingBottom: '0.5em',
	},
	editButton: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		paddingTop: '6px',
		boxShadow: '0 1px 2px rgba(16, 22, 26, 0.3)'
	},
	loader: {
		position: 'absolute',
		bottom: 3,
		left: 3,
		backgroundColor: 'white',
	},	
	tooltipText: {
		maxWidth: '275px',
		display: 'inline-block',
	},
	imageCropperWrapper: {
		height: '100vh',
		width: '100vw',
		backgroundColor: 'rgba(255,255,255,0.75)',
		position: 'fixed',
		top: 0,
		left: 0,
		opacity: 0,
		pointerEvents: 'none',
		transition: '.1s linear opacity',
		display: 'flex',
		justifyContent: 'center',
	},
	imageCropperWrapperVisible: {
		opacity: 1,
		pointerEvents: 'auto',
	},
	imageCropper: {
		height: '270px',
		width: '450px',
		alignSelf: 'center',
		backgroundColor: 'white',
		boxShadow: '0px 0px 10px #808284',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			width: '100%',
			height: 'auto',
			left: 0,
		},
	},
};
