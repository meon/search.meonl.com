package meon::I18N;

use base 'Locale::Maketext';
use File::Spec;
use File::Basename 'dirname';
use File::Slurp 'read_file', 'write_file';
use List::MoreUtils 'any';

use 5.010;
use feature 'state';

use Locale::Maketext::Lexicon {
	'*' => [Gettext => File::Spec->catfile(dirname(__FILE__), 'I18N', '*.po')],
	_decode => 1,
	_use_fuzzy => 1,
};

our $MONTHS = join ('|', qw(
	january
	february
	march
	april
	may
	june
	july
	august
	september
	october
	november
	december
));

sub loc {
	my $self   = shift;
	my $key    = shift;
	my @params = @_;
	
	# make array out of array ref if it is the only parameter
	if ((@params == 0) and (ref $key eq 'ARRAY' )) {
		($key, @params) = @{$key};
	}
	
	my $trans = eval { $self->maketext($key, @params) };

	if (not $trans) {
		$self->missing_key($key);
		
		my $lexicon = eval '\%'.(ref $self).'::Lexicon';
		
		$lexicon->{$key} = $key;
		$trans = $self->maketext($key, @params);
	}
	
	return $trans;
}

sub missing_key {
	my $self   = shift;
	my $key    = shift;
	
	$key =~ s/\[_(\d+)\]/%$1/g;
	
	my ($lang) = (ref $self) =~ m/::([^:]+$)/;
	die 'failed to get language'.(ref $self)
		if not $lang;
	
	# read already found missing keys
	my $missing_keys_filename = File::Spec->catfile(dirname(__FILE__), 'I18N', $lang.'-missing-keys.txt');
	write_file($missing_keys_filename) if (not -f $missing_keys_filename);
	my @missing_keys = read_file($missing_keys_filename);
	return if any { $_ eq qq{msgid "$key"\n} } @missing_keys;
	
	# record missing key
	push @missing_keys,
		'#: '.$self->source_filename."\n",
		qq{msgid "$key"\n},
		qq{msgstr ""\n\n},
	;
	write_file($missing_keys_filename, @missing_keys);
}

sub source_filename {
	my $class = shift;
	my $filename = shift;
	
	state $filename_store;
	$filename_store = $filename
		if ($filename);
	
	return $filename_store || 'unknown';
}

sub is_blacklisted {
	my $self = shift;
	my $key  = shift;
	
	state $blacklisted_keys_filename = File::Spec->catfile(dirname(__FILE__), 'I18N', 'blacklisted-keys.txt');
	state @blacklisted_keys;
	@blacklisted_keys = map { chomp; $_; } read_file($blacklisted_keys_filename)
		if not @blacklisted_keys;
	
	return any { $_ eq $key } @blacklisted_keys;
}

1;
