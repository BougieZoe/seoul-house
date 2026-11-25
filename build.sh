#!/bin/bash
# Concatenate the source parts into one ES module and inline it into the HTML shell (dev build, needs an import map-free three.js bundle -> use build_standalone.sh for the real thing).
set -e
cd "$(dirname "$0")/src"
cat p1_core.js p0_i18n.js p2_world.js p3_house.js p5_detail.js p7_life.js p8_props.js p4_systems.js p6_tour.js p9_ds.js > ../all.js
node --check ../all.js
echo "all.js ready"
