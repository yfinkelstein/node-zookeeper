npm pack --proprietary-attribs false | perl -pe 'print STDERR' | xargs gtar -tzf
