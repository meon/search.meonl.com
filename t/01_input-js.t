#!/usr/bin/perl

use strict;
use warnings;

#use Test::More 'no_plan';
use Test::More tests => 8;
use Test::Differences;
use Test::Exception;
use JavaScript;
use IO::Any;
use URI::Escape 'uri_escape'; 

use FindBin qw($Bin);
use lib "$Bin/lib";

our $context = JavaScript::Runtime->new->create_context();

exit main();

sub main {
	ok(js_file_eval(['src', 'js', '09_input.js']), 'load 09_input.js') || diag $@;
	is_deeply(
		js_eval('input.decodeQueryParam("123++321")'),
		'123 321',
		'input.decodeQueryParam'
	) || diag $@;
	is_deeply(
		js_eval('input.keywords(input.decodeQueryParam("123++321"))'),
		[123, 321],
		'input.keywords(input.decodeQueryParam())'
	) || diag $@;
	is_deeply(
		js_eval('input.decodeQueryParam("'.uri_escape('123 321').'")'),
		'123 321',
		'input.decodeQueryParam'
	) || diag $@;
	is_deeply(
		js_eval('input.keywords(input.decodeQueryParam("'.uri_escape('123 321').'"))'),
		[123, 321],
		'input.keywords(input.decodeQueryParam())'
	) || diag $@;
	is_deeply(
		js_eval('input.keywords(input.decodeQueryParam("'.uri_escape('123 321 "1 2 3"', "^A-Za-z0-9\-\._~").'"))'),
		[123, 321, '"1 2 3"'],
		'input.keywords(input.decodeQueryParam())'
	) || diag $@;
	is_deeply(
		js_eval('input.keywords(input.decodeQueryParam("'.uri_escape('~123 -321 +"1 2 3"', "^A-Za-z0-9\-\._~").'"))'),
		['~123', -321, '+"1 2 3"'],
		'input.keywords(input.decodeQueryParam())'
	) || diag $@;
	is_deeply(
		js_eval(q{input.plainKeywords(["~123", "-321", '+"1 2 3"'])}),
		[['~', 123], ['-', 321], ['+', '1 2 3']],
		'input.plainKeywords'
	) || diag $@;
	
	
	return 0;
}


sub js_eval {
    my $js_string = shift;
    return if not defined $js_string;
    
    return $context->eval($js_string);
}

sub js_file_eval {
    my $filename = shift;
    return js_eval(IO::Any->slurp($filename));
}

sub get_js_context {
    return $context;
}
