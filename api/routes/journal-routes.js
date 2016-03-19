var app = require('../api');
var passport = require('passport');
var _         = require('underscore');

var Journal = require('../models').Journal;
var User = require('../models').User;
var Pub = require('../models').Pub;
var Asset = require('../models').Asset;
var Notification = require('../models').Notification;
import {cloudinary} from '../services/cloudinary';

app.post('/createJournal', function(req,res){
	Journal.isUnique(req.body.subdomain, (err, result)=>{
		if(!result){ return res.status(500).json('Subdomain is not Unique!'); }

		const journal = new Journal({
			journalName: req.body.journalName,
			subdomain: req.body.subdomain,
			createDate: new Date().getTime(),
			admins: [req.user._id],
			collections: [],
			pubsFeatured: [],
			pubsSubmitted: [],
			design: {
				headerBackground: '#373737',
				headerText: '#E0E0E0',
				headerHover: '#FFF',
				landingHeaderBackground: '#E0E0E0',
				landingHeaderText: '#373737',
				landingHeaderHover: '#000',
			},

				
		});

		journal.save(function (err, savedJournal) {
			if (err) { return res.status(500).json(err);  }
			User.update({ _id: req.user._id }, { $addToSet: { adminJournals: savedJournal._id} }, function(err, result){if(err) return handleError(err)});

			return res.status(201).json(savedJournal.subdomain);	

		});
	});

	
});

app.get('/getJournal', function(req,res){
	Journal.findOne({subdomain: req.query.subdomain})
	.populate(Journal.populationObject())
	.lean().exec(function(err, result){

		if (err) { return res.status(500).json(err);  }

		let isAdmin = false;
		const userID = req.user ? req.user._id : undefined;
		const adminsLength = result ? result.admins.length : 0;
		for(let index = adminsLength; index--; ) {
			if (String(result.admins[index]._id) === String(userID)) {
				isAdmin =  true;	
			}
		}

		return res.status(201).json({
			...result,
			isAdmin: isAdmin,
		});
	});
});

app.get('/getRandomSlug', function(req, res) {
	Pub.getRandomSlug(req.query.journalID, function(err, result){
		if (err){console.log(err); return res.json(500);} 
		return res.status(201).json(result);
	});
});
	
app.post('/saveJournal', function(req,res){
	Journal.findOne({subdomain: req.body.subdomain}).exec(function(err, journal) {
		// console.log('in server save journal');
		// console.log('req.body', req.body);
		// console.log('journal', journal);

		if (err) { return res.status(500).json(err);  }

		if (!req.user || String(journal.admins).indexOf(String(req.user._id)) === -1) {
			return res.status(403).json('Not authorized to administrate this Journal.');
		}

		if ('customDomain' in req.body.newObject && req.body.newObject.customDomain !== journal.customDomain){
			// console.log('we got a new custom domain!');
			Journal.updateHerokuDomains(journal.customDomain, req.body.newObject.customDomain);

		}

		if ('pubsFeatured' in req.body.newObject) {
			// If there are new pubs to be featured, we have to update the pub with a new feature entry
			// We don't have to update any submit entries, as you can't do that from the journal curate page
			const newFeatured = req.body.newObject.pubsFeatured;
			const oldFeatured = journal.pubsFeatured.map((pubID)=>{return String(pubID)});
			const pubsToUpdateFeature = _.difference(newFeatured, oldFeatured);
			for (let index = pubsToUpdateFeature.length; index--;) {
				Pub.addJournalFeatured(pubsToUpdateFeature[index], journal._id, req.user._id);
			}
		}

		for (const key in req.body.newObject) {
			if (req.body.newObject.hasOwnProperty(key)) {
				journal[key] = req.body.newObject[key];
			}
		}
		
		journal.save(function(err, result){
			if (err) { return res.status(500).json(err);  }
			
			Journal.populate(result, Journal.populationObject(), (err, populatedJournal)=> {
				return res.status(201).json({
					...populatedJournal.toObject(),
					isAdmin: true,
				});		
			});
			
			
		});
	});
});

app.post('/submitPubToJournal', function(req,res){
	Journal.findOne({_id: req.body.journalID}).exec(function(err, journal) {
		if (err) { return res.status(500).json(err);  }

		if (!journal) { return res.status(500).json(err);  }

		if ( !journal.autoFeature && (!req.user || String(journal.admins).indexOf(String(req.user._id)) === -1) ) {
			return res.status(403).json('Not authorized to administrate this Journal.');
		}

		if (String(journal.pubsSubmitted).indexOf(req.body.pubID) === -1 && String(journal.pubsFeatured).indexOf(req.body.pubID) === -1) {
			
			Pub.addJournalSubmitted(req.body.pubID, req.body.journalID, req.user._id);

			if (journal.autoFeature) {
				journal.pubsFeatured.push(req.body.pubID);
				Pub.addJournalFeatured(req.body.pubID, req.body.journalID, null);
			} else {
				journal.pubsSubmitted.push(req.body.pubID);
			}


		}

		journal.save(function(err, result){
			if (err) { return res.status(500).json(err);  }
			
			Journal.populate(result, Journal.populationObject(), (err, populatedJournal)=> {
				return res.status(201).json({
					...populatedJournal.toObject(),
					isAdmin: true,
				});		
			});
			
			
		});
	});
});


var fs = require('fs');

app.get('/loadJournalAndLogin', function(req,res){
	// Load journal Data
	// When an implicit login request is made using the cookie
	// console.time("dbsave");
	Journal.findOne({ $or:[ {'subdomain':req.query.host.split('.')[0]}, {'customDomain':req.query.host}]})
	.populate(Journal.populationObject())
	.lean().exec(function(err, result){
		// console.timeEnd("dbsave");
		const journalID = result ? result._id : null;
		Pub.getRandomSlug(journalID, function(err, randomSlug) {
			const locale = result && result.locale ? result.locale : 'en';
			let languageObject = {};
			fs.readFile(__dirname + '/../../translations/languages/' + locale + '.json', 'utf8', function (err, data) {
				if (err) { console.log(err); }
				languageObject = JSON.parse(data);

				const userID = req.user ? req.user._id : undefined;
				Notification.getUnreadCount(userID, function(err, notificationCount) {
					const loginData = req.user 
						? {
							name: req.user.name,
							firstName: req.user.firstName,
							lastName: req.user.lastName,
							username: req.user.username,
							image: req.user.image,
							thumbnail: req.user.thumbnail,
							settings: req.user.settings,
							following: req.user.following,
							notificationCount: notificationCount,
							assets: req.user.assets,
						}
						: 'No Session';
						
					Asset.find({'_id': { $in: loginData.assets } }, function(err, assets){
						if (assets.length) {
							loginData.assets = assets;	
						}
     					
     					if (result) {
							// If it is a journal, check if the user is an admin.
							let isAdmin = false;
							const userID = req.user ? req.user._id : undefined;
							const adminsLength = result ? result.admins.length : 0;
							for(let index = adminsLength; index--; ) {
								if (String(result.admins[index]._id) === String(userID)) {
									isAdmin =  true;	
								}
							}

							return res.status(201).json({
								journalData: {
									...result,
									isAdmin: isAdmin,
									randomSlug: randomSlug,
								},
								languageData: {
									locale: locale,
									languageObject: languageObject,
								},
								loginData: loginData,
							});

						} else { 
							// If there was no result, that means we're on pubpub.org, and we need to populate journals and pubs.
							Journal.find({}, {'_id':1,'journalName':1, 'subdomain':1, 'customDomain':1, 'pubsFeatured':1, 'collections':1, 'design': 1}).lean().exec(function (err, journals) {
								Pub.find({history: {$not: {$size: 0}},'settings.isPrivate': {$ne: true}}, {'_id':1,'title':1, 'slug':1, 'abstract':1}).lean().exec(function (err, pubs) {
									// console.log(res);
									return res.status(201).json({
										journalData: {
											...result,
											allJournals: journals,
											allPubs: pubs,
											isAdmin: false,
											// locale: locale,
											// languageObject: languageObject,
											randomSlug: randomSlug,
										},
										languageData: {
											locale: locale,
											languageObject: languageObject,
										},
										loginData: loginData,
									});

								});
							});
						}
					});
					
				});

			});
		});
	});

});

app.post('/createCollection', function(req,res){
	// return res.status(201).json(['cat','dog']);
	Journal.findOne({subdomain: req.body.subdomain}).exec(function(err, journal) {
		const defaultHeaderImages = [
			'https://res.cloudinary.com/pubpub/image/upload/v1451320792/coll4_ivgyzj.jpg',
			'https://res.cloudinary.com/pubpub/image/upload/v1451320792/coll5_nwapxj.jpg',
			'https://res.cloudinary.com/pubpub/image/upload/v1451320792/coll6_kqgzbq.jpg',
			'https://res.cloudinary.com/pubpub/image/upload/v1451320792/coll7_mrq4q9.jpg',
		];

		const newCollection = {
			title: req.body.newCollectionObject.title,
			slug: req.body.newCollectionObject.slug,
			description: '',
			pubs: [],
			headerImage: defaultHeaderImages[Math.floor(Math.random() * defaultHeaderImages.length)],
		};
		journal.collections.push(newCollection);
		
		journal.save(function (err, savedJournal) {
			if (err) { return res.status(500).json(err);  }

			Journal.populate(savedJournal, Journal.populationObject(true), (err, populatedJournal)=> {
				if (err) { return res.status(500).json(err);  }

				return res.status(201).json(populatedJournal.collections);		
			});

		});
	});
});

app.post('/saveCollection', function(req,res){
	Journal.findOne({subdomain: req.body.subdomain}).exec(function(err, journal) {
		const collections = journal ? journal.collections : [];

		function updateAndSave(cloudinaryURL) {
			for (let index = collections.length; index--;) {
				if (collections[index].slug === req.body.slug) {
					if (cloudinaryURL) {
						journal.collections[index].headerImage = cloudinaryURL;
					}
					for (const key in req.body.newCollectionObject) {
						if (req.body.newCollectionObject.hasOwnProperty(key)) {
							journal.collections[index][key] = req.body.newCollectionObject[key];
						}
					}
					break;
				}
			}
			journal.save(function (err, savedJournal) {
				if (err) { return res.status(500).json(err);  }

				Journal.populate(savedJournal, Journal.populationObject(true), (err, populatedJournal)=> {
					if (err) { return res.status(500).json(err);  }

					return res.status(201).json(populatedJournal.collections);		
				});

			});
		}

		if (req.body.newCollectionObject.headerImageURL) {
			cloudinary.uploader.upload(req.body.newCollectionObject.headerImageURL, function(cloudinaryResponse) { 
				const cloudinaryURL = cloudinaryResponse.url; 
				updateAndSave(cloudinaryURL);
				
			});
		} else {
			updateAndSave();
		}

	});
});
