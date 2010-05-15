#!/usr/bin/perl

use strict;
use warnings;

use Test::JavaScript::More '../src/js/10_navigation.js';

// from here on the script is all JavaScript
plan(1);

ok( navi, "navi object exists" );
