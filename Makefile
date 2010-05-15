TT = tt
TT_DYN = tt-dyn
TT_LIB = tt-lib
TT_CONTENT = tt-content
HTML = html
TARGETLANG = en

JS_i18n_FILES=\
	src/js/05_searches-data.js \
	src/js/10_columns.js \

XGETTEXT_JS=xgettext --join-existing --sort-by-file --omit-header -L C -ki18n:2c,3,4,4t -ki18n:2,3,3t -ki18n:1c,2,2t -ki18n
YUICOMPRESSOR=java -jar script/yuicompressor-2.4.2.jar

TIME := $(shell date '+%s')

.PHONY: all
all: ttree content

.PHONY: ttree
ttree: html/js/min.js html/js/jsloc-${TARGETLANG}.js
	perl -Ilib script/ttree --define lang=$(TARGETLANG) --dest $(HTML)/$(TARGETLANG) -f tt-$(TARGETLANG).cfg | grep -E '^  [+>!]' || true     # true there because grep returns exit value 1 if no line match

html/js/min.js: src/js/*
	mkdir -p html/js
	cat src/js/* > html/js/min.js

.PHONY: content
content:
	perl -Ilib script/ttree --define lang=$(TARGETLANG) --dest $(HTML)/ -f tt-content.cfg | grep -E '^  [+>!]' || true    # true there because grep returns exit value 1 if no line match



.PHONY: $(HTML)/sitemap.xml sitemap

sitemap: $(HTML)/sitemap.xml

$(HTML)/sitemap.xml:
	script/gen-sitemap

minify: clean complete-rebuild minify-js minify-html minify-css update-minify-names

.PHONY: minify-html
minify-html: all
	find html/ -name '*.html' -exec htmlclean -v {} \;
	find html/ -name '*.bak' -exec rm {} \;

.PHONY: minify-js
minify-js: html/js/min.js
	cat $< | ${YUICOMPRESSOR} --type js --charset UTF-8 -o $<.tmp
	mv $<.tmp $<

.PHONY: minify-css
minify-css: all
	cat html/css/style.css | ${YUICOMPRESSOR} --type css --charset UTF-8 -o html/css/style.css.tmp
	mv html/css/style.css.tmp html/css/style.css
	cat html/css/style-js.css | ${YUICOMPRESSOR} --type css --charset UTF-8 -o html/css/style-js.css.tmp
	mv html/css/style-js.css.tmp html/css/style-js.css

.PHONY: update-minify-names
update-minify-names:
	find html/ -name '*.html' -exec perl -lane 'BEGIN { $$t=shift @ARGV }; s/style(-js)?.css/style$$1-$$t.css/;print;' -i ${TIME} {} \; 
	find html/ -name '*.html' -exec perl -lane 'BEGIN { $$t=shift @ARGV }; s{js/min.js}{js/min-$$t.js};print;' -i ${TIME} {} \; 
	find html/ -name '*.html' -exec perl -lane 'BEGIN { $$t=shift @ARGV }; s{js/jsloc-(..)\.js}{js/jsloc-$$1-$$t.js};print;' -i ${TIME} {} \; 
	mv html/css/style.css html/css/style-${TIME}.css
	mv html/css/style-js.css html/css/style-js-${TIME}.css
	mv html/js/min.js html/js/min-${TIME}.js
	ls html/js/jsloc-*.js | perl -lane 'BEGIN { $$t=shift @ARGV }; system("mv", $$_, substr($$_,0,-3)."-".$$t.".js");' ${TIME}

.PHONY: upload upload-dev
upload:
	rsync -azv html/ jk@pluto.int.meon.sk:/var/www/search.meonl.com/

upload-dev:
	rsync --delete -azv html/ jk@pluto.int.meon.sk:/var/www/search-dev.meonl.com/

.PHONY: clean
clean:
	rm -rf html/*
	rm -f lib/meon/I18N/*-missing-keys.txt

complete-rebuild: clean
	make content
	make TARGETLANG=en ttree
	make TARGETLANG=sk ttree
	make TARGETLANG=de ttree
	make TARGETLANG=cs ttree
	make html/sitemap.xml

#lib/meon/I18N/jsloc-${TARGETLANG}.po: ${JS_i18n_FILES}
#	${XGETTEXT_JS} --output $@ $<

html/js/jsloc-${TARGETLANG}.js: lib/meon/I18N/jsloc-${TARGETLANG}.po
	echo -n 'var locale_data =' `script/po2json $<` > $@
