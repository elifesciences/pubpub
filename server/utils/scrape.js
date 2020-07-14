const defaultProcessor = ($el) => $el.attr('content') || $el.text().trim();
const defaultMultipleProcessor = ($el, $) => $el.toArray().map((el) => defaultProcessor($(el)));

const doiProcessor = ($el) => {
	const doi = defaultProcessor($el);

	if (!doi) {
		return null;
	}

	return doi.replace(/^doi:/g, '');
};

const dateProcessor = ($el) => new Date(defaultProcessor($el));

const queryDocument = (config, $) => {
	let result;

	// Execute queries in order
	for (let i = 0; i < config.length; i++) {
		const query = config[i];

		let $el;
		let process;
		let multiple = false;

		if (typeof query === 'string') {
			// String form of query, e.g. "a.author"
			$el = $(query);
		} else {
			// Object form of query, e.g.
			//   { selector: "a.author", process: $el => $el.attr("href") }
			$el = $(query.selector);

			// Process only first element by default.
			multiple = Boolean(query.multiple);
			process = query.process;
		}

		if (!multiple) {
			$el = $($el.get(0));
		}

		if (multiple || $el.length > 0) {
			// Use default processor if none is specified (content attr value or innerText)
			result = (process || (multiple ? defaultMultipleProcessor : defaultProcessor))($el, $);

			// Stop on first result
			if (multiple ? result.length > 0 : result) {
				break;
			}
		}
	}

	return result || null;
};

// In general, the order of preference is DC > highwire/google scholar > OGP > web standards > best guess
export const pubEdgeQueries = {
	avatar: [
		// OGP
		'meta[property*="og:image:secure_url" i]',
		'meta[property*="og:image" i]',
		// Twitter
		'meta[name*="twitter:image" i]',
		// Best guess
		{ selector: 'article img, .abstract img', process: ($el) => $el.attr('src') },
	],
	contributors: [
		// DC
		{
			selector: 'meta[name*="dc.creator" i]',
			multiple: true,
		},
		// Highwire/Google Scholar
		{ selector: 'meta[name*="citation_author" i]', multiple: true },
		// OGP
		{ selector: 'meta[property*="article:author" i]', multiple: true },
		// Web standard
		{ selector: 'meta[name*="author" i]', multiple: true },
		// Best guess
		{
			selector: '[rel*="author" i], .author',
			multiple: true,
		},
	],
	doi: [
		// DC
		{ selector: 'meta[name*="dc.identifier" i]', process: doiProcessor },
		// Highwire/Google Scholar
		{ selector: 'meta[name*="citation_doi" i]', process: doiProcessor },
		// Prism
		{ selector: 'meta[name*="prism.doi" i]', process: doiProcessor },
		// Web standard
		{ selector: 'meta[name*="doi" i]', process: doiProcessor },
	],
	url: [
		// Highwire/Google Scholar
		'meta[name*="citation_public_url" i]',
		// OG
		'meta[property*="og:url" i]',
		// Web standard
		{ selector: 'link[rel="canonical"]', process: ($el) => $el.attr('href') },
	],
	publicationDate: [
		// DC
		{ selector: 'meta[name*="dc.date" i]', process: dateProcessor },
		// Highwire/Google Scholar
		{ selector: 'meta[name*="citation_publication_date" i]', process: dateProcessor },
		// OGP
		{ selector: 'meta[property*="article:published_time" i]', process: dateProcessor },
		// Prism
		{
			selector: 'meta[name*="prism.publicationDate" i]',
			process: dateProcessor,
		},
		// Best guess
		{
			selector: 'article time, article .date',
			process: ($el) => new Date(dateProcessor($el) || $el.attr('datetime')),
		},
	],
	title: [
		// DC
		'meta[name*="dc.title" i]',
		// Highwire/Google Scholar
		'meta[name*="citation_title" i]',
		// OGP
		'meta[property*="og:title" i]',
		// Web standard
		'title',
	],
	description: [
		// Break our convention here a little by searching for an abstract first
		'meta[name*="citation_abstract" i]',
		// DC
		'meta[name*="dc.description" i]',
		// OGP
		'meta[property*="og:description" i]',
		// Web standard
		'meta[name*="description" i]',
	],
};

export const runQueries = ($, queries) =>
	Object.entries(queries).reduce((results, [key, query]) => {
		return { ...results, [key]: queryDocument(query, $) };
	}, {});
