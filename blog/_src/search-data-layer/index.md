---
title: Where the data comes from
description: How Toque search works, part 1. How 1,276 Canberra places and 33,143 dishes are found, read, checked, described and kept fresh, so that search can run on the phone with no wait.
date: 2026-10-30
category: Search
series: How Toque search works
part: 1
draft: true
---

<p class="lede">Search can only be as good as the data under it. This is how Toque's data is made: where the places, menus, dishes and opening hours come from, how they are cleaned and structured, and how they stay fresh.</p>

<!-- toc -->

## Premise

<figure class="fig fig-wall" id="fig-searches">
<div class="wall" role="img" aria-label="143 searches from our evaluation set, packed around a search field">
<div class="rows">
<div class="wrow" style="--r:0"><span class="p" data-kind="venue">lamb shoulder at italian and sons</span><span class="p" data-kind="place">noodles near ANU</span><span class="p" data-kind="mod">grilled chicken salad</span><span class="p" data-kind="place">sushi in Gungahlin</span><span class="p" data-kind="venue">senn noods</span><span class="p" data-kind="dish">butter chicken</span><span class="p" data-kind="mod">gluten-free pasta</span><span class="p" data-kind="mod">vegan curry</span><span class="p" data-kind="mood">brunch with friends</span><span class="p" data-kind="mod">mild butter chicken</span><span class="p" data-kind="dish">hot pot</span><span class="p" data-kind="dish">carbonara</span><span class="p" data-kind="dish">tonkotsu ramen</span><span class="p" data-kind="cuisine">middle eastern</span><span class="p" data-kind="dish">eggs benedict</span><span class="p" data-kind="dish">chicken biryani</span><span class="p" data-kind="dish">pho</span><span class="p" data-kind="dish">green curry</span><span class="p" data-kind="dish">katsu curry</span><span class="p" data-kind="dish">lasagne</span></div>
<div class="wrow" style="--r:1"><span class="p" data-kind="mod">cheap pho</span><span class="p" data-kind="mod">dumplings open now</span><span class="p" data-kind="mood">hangover food</span><span class="p" data-kind="mod">burger under $20</span><span class="p" data-kind="dish">bulgogi</span><span class="p" data-kind="venue">bao at akiba</span><span class="p" data-kind="cuisine">japanese food</span><span class="p" data-kind="dish">ramen</span><span class="p" data-kind="mood">something warm and comforting</span><span class="p" data-kind="mod">vegetarian pad thai</span><span class="p" data-kind="dish">smashed avo</span><span class="p" data-kind="dish">hainanese chicken rice</span><span class="p" data-kind="mod">crispy pork belly</span><span class="p" data-kind="dish">dumplings</span><span class="p" data-kind="cuisine">malaysian</span><span class="p" data-kind="mood">something sweet</span><span class="p" data-kind="neg">dumplings no pork</span><span class="p" data-kind="neg">salad without onion</span><span class="p" data-kind="dish">char kway teow</span></div>
<div class="wrow" style="--r:2"><span class="p" data-kind="dish">margherita pizza</span><span class="p" data-kind="dish">shakshuka</span><span class="p" data-kind="dish">chicken parmi</span><span class="p" data-kind="cuisine">mexican</span><span class="p" data-kind="cuisine">indian</span><span class="p" data-kind="mod">gluten free pizza</span><span class="p" data-kind="dish">dan dan noodles</span><span class="p" data-kind="venue">supalove fried chicken</span><span class="p" data-kind="neg">curry without coconut</span><span class="p" data-kind="neg">pad thai no peanuts</span><span class="p" data-kind="mod">spicy ramen</span><span class="p" data-kind="venue">dumpling king xiao long bao</span><span class="p" data-kind="mod">vegan burger</span><span class="p" data-kind="place">brunch in Braddon</span><span class="p" data-kind="venue">messina gelato</span><span class="p" data-kind="neg">ramen without pork</span><span class="p" data-kind="dish">mapo tofu</span><span class="p" data-kind="mood">healthy lunch</span><span class="p" data-kind="mood">light lunch</span></div>
<div class="wrow" style="--r:3"><span class="p" data-kind="dish">burrito</span><span class="p" data-kind="mod">seafood laksa</span><span class="p" data-kind="mood">dinner for a big group</span><span class="p" data-kind="dish">masala dosa</span><span class="p" data-kind="place">indian in Phillip</span><span class="p" data-kind="place">ramen in Civic</span><span class="p" data-kind="dish">souvlaki</span><span class="p" data-kind="mood">cheap eats</span><span class="p" data-kind="dish">congee</span><span class="p" data-kind="mod">vegetarian dumplings</span><span class="p" data-kind="venue">bibimbap at taki</span><span class="p" data-kind="place">coffee and cake in Kingston</span><span class="p" data-kind="dish">schnitzel</span><span class="p" data-kind="dish">beef rendang</span><span class="p" data-kind="mod">not too spicy curry</span><span class="p" data-kind="mod">vegetarian laksa</span><span class="p" data-kind="place">thai in Tuggeranong</span><span class="p" data-kind="dish">udon</span><span class="p" data-kind="cuisine">vietnamese</span><span class="p" data-kind="venue">pho at dickson</span><span class="p" data-kind="place">burgers near me</span></div>
<div class="wrow" style="--r:4"><span class="p" data-kind="dish">tom yum soup</span><span class="p" data-kind="mod">dairy free dessert</span><span class="p" data-kind="dish">spicy fried chicken</span><span class="p" data-kind="dish">poke bowl</span><span class="p" data-kind="dish">xiao long bao</span><span class="p" data-kind="dish">gyoza</span><span class="p" data-kind="mod">sushi under $15</span><span class="p" data-kind="mod">vegan tacos</span><span class="p" data-kind="venue">laksa at wokitup</span><span class="p" data-kind="cuisine">greek food</span><span class="p" data-kind="place">pizza in Braddon</span><span class="p" data-kind="mod">spicy tofu</span><span class="p" data-kind="dish">soup dumplings</span><span class="p" data-kind="dish">korean fried chicken</span><span class="p" data-kind="cuisine">turkish</span><span class="p" data-kind="mood">hearty meal for a cold day</span><span class="p" data-kind="dish">pad thai</span><span class="p" data-kind="dish">fish and chips</span><span class="p" data-kind="mod">spicy noodles under $20</span><span class="p" data-kind="dish">tacos</span><span class="p" data-kind="place">dumplings in belco</span></div>
<div class="wrow" style="--r:5"><span class="p" data-kind="dish">sushi</span><span class="p" data-kind="place">vegan brunch in Dickson</span><span class="p" data-kind="neg">laksa without prawns</span><span class="p" data-kind="neg">pizza no meat</span><span class="p" data-kind="mood">quick bite</span><span class="p" data-kind="place">laksa in Woden</span><span class="p" data-kind="place">pho in Belconnen</span><span class="p" data-kind="dish">bibimbap</span><span class="p" data-kind="venue">kinn thai pad thai</span><span class="p" data-kind="place">korean in Civic</span><span class="p" data-kind="mood">spicy food</span><span class="p" data-kind="neg">burger no beef</span><span class="p" data-kind="cuisine">thai</span><span class="p" data-kind="dish">peking duck</span><span class="p" data-kind="cuisine">yum cha</span><span class="p" data-kind="mood">something crispy</span><span class="p" data-kind="mod">beef pho under $20</span><span class="p" data-kind="mod">halal fried chicken</span><span class="p" data-kind="cuisine">sichuan food</span><span class="p" data-kind="mod">gluten free fish and chips</span><span class="p" data-kind="dish">laksa</span></div>
<div class="wrow" style="--r:6"><span class="p" data-kind="dish">banh mi</span><span class="p" data-kind="neg">pasta no cream</span><span class="p" data-kind="cuisine">nepalese food</span><span class="p" data-kind="mod">prawn dumplings</span><span class="p" data-kind="place">fish and chips in Manuka</span><span class="p" data-kind="dish">roti canai</span><span class="p" data-kind="dish">acai bowl</span><span class="p" data-kind="dish">massaman curry</span><span class="p" data-kind="dish">xlb</span><span class="p" data-kind="mod">chicken noodle soup</span><span class="p" data-kind="cuisine">italian</span><span class="p" data-kind="dish">momo</span><span class="p" data-kind="mood">comfort food</span><span class="p" data-kind="dish">nasi goreng</span><span class="p" data-kind="place">dumplings in Dickson</span><span class="p" data-kind="mood">something fresh and light</span><span class="p" data-kind="venue">lazy su</span><span class="p" data-kind="dish">fried rice</span><span class="p" data-kind="mood">date night dinner</span><span class="p" data-kind="cuisine">something korean</span><span class="p" data-kind="neg">noodles not spicy</span><span class="p" data-kind="mod">vegetarian banh mi</span></div>
</div>
<div class="sbar"><div class="field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><span class="typed" aria-live="polite">Search dishes, places, moods</span><span class="caret" aria-hidden="true"></span><span class="kind"></span></div></div>
</div>
<div class="kinds" role="group" aria-label="Kinds of search"><button type="button" data-k="name">Names<b>61</b></button><button type="button" data-k="filter">Filters<b>53</b></button><button type="button" data-k="open">Open-ended<b>29</b></button></div>
<figcaption><b>Figure 1.</b> Queries are not always specific. Pick a type to see its searches.</figcaption>
</figure>

Searches fall into three types, ranging from specific to open-ended. Name-based searches look for a particular dish or restaurant. Filter-based searches narrow the options by price, suburb, or exclusions. Open-ended searches seek recommendations based on a cuisine, a craving, or an occasion.

Supporting all three types requires two capabilities: extracting everything a menu states, and interpreting that content well enough to answer open-ended searches. Beyond this breadth and depth, we impose further performance requirements: search should be low-cost in four respects, namely errors, latency, money and size.

## Goals

Errors, latency and money share first priority (Figure 2).

<figure class="fig fig-costs" id="fig-costs">
<div class="costs">
<div class="cost"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.3 2.3 4.7-4.9"/></svg><b>Errors</b><p>Results should be correct. A larger app or a slower build is acceptable when it measurably reduces errors.</p></div>
<div class="cost"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg><b>Latency</b><p>Results should appear without delay. On-device search rules out a large model per query, so meaning is encoded in the data.</p></div>
<div class="cost"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.4c-.5-.8-1.5-1.3-2.6-1.3-1.4 0-2.6.8-2.6 1.9 0 2.6 5.2 1.4 5.2 4 0 1.1-1.2 1.9-2.6 1.9-1.1 0-2.1-.5-2.6-1.3M12 6.6v1.5M12 15.9v1.5"/></svg><b>Money</b><p>Queries incur no paid API calls. Build-time processing relies on open data, open models on free hardware, and manual effort.</p></div>
</div>
<figcaption><b>Figure 2.</b> The three costs with first priority.</figcaption>
</figure>

## Building a dataset for menu reading

The menu-reading model is retrained from scratch. Its pages are split by restaurant, so the test set holds only restaurants the model has never seen (Figure 3).

<figure class="fig fig-split" id="fig-split">
<div class="split">
<div class="step">
<div class="head"><b>Step 1. Split 2,946 restaurants</b><ul class="key"><li class="tr"><i></i>Train</li><li class="va"><i></i>Validation</li><li class="te"><i></i>Test</li></ul></div>
<div class="seg big" role="img" aria-label="2,946 venues: about 2,062 train, 295 validation, 589 test"><i class="tr" style="--f:70">70%</i><i class="va" style="--f:10">10%</i><i class="te" style="--f:20">20%</i></div>
</div>
<div class="step">
<b>Step 2. Label 1,400 pages by layout class</b>
<ul class="classes">
<li><span class="name">Simple price lists</span><span class="track"><span class="seg" style="--n:257" role="img" aria-label="Simple price lists: 257 pages, 180 train, 26 validation, 51 test"><i class="tr" style="--f:180"></i><i class="va" style="--f:26"></i><i class="te" style="--f:51"></i></span><b>257</b></span></li>
<li><span class="name">Multi-column, with descriptions</span><span class="track"><span class="seg" style="--n:280" role="img" aria-label="Multi-column, with descriptions: 280 pages, 196 train, 28 validation, 56 test"><i class="tr" style="--f:196"></i><i class="va" style="--f:28"></i><i class="te" style="--f:56"></i></span><b>280</b></span></li>
<li><span class="name">Online ordering pages</span><span class="track"><span class="seg" style="--n:272" role="img" aria-label="Online ordering pages: 272 pages, 190 train, 28 validation, 54 test"><i class="tr" style="--f:190"></i><i class="va" style="--f:28"></i><i class="te" style="--f:54"></i></span><b>272</b></span></li>
<li><span class="name">Prose and set menus</span><span class="track"><span class="seg" style="--n:196" role="img" aria-label="Prose and set menus: 196 pages, 137 train, 20 validation, 39 test"><i class="tr" style="--f:137"></i><i class="va" style="--f:20"></i><i class="te" style="--f:39"></i></span><b>196</b></span></li>
<li><span class="name">Drinks lists</span><span class="track"><span class="seg" style="--n:126" role="img" aria-label="Drinks lists: 126 pages, 88 train, 13 validation, 25 test"><i class="tr" style="--f:88"></i><i class="va" style="--f:13"></i><i class="te" style="--f:25"></i></span><b>126</b></span></li>
<li><span class="name">Messy layouts</span><span class="track"><span class="seg" style="--n:100" role="img" aria-label="Messy layouts: 100 pages, 70 train, 10 validation, 20 test"><i class="tr" style="--f:70"></i><i class="va" style="--f:10"></i><i class="te" style="--f:20"></i></span><b>100</b></span></li>
<li><span class="name">Scanned or out-of-order PDFs</span><span class="track"><span class="seg" style="--n:169" role="img" aria-label="Scanned or out-of-order PDFs: 169 pages, 118 train, 17 validation, 34 test"><i class="tr" style="--f:118"></i><i class="va" style="--f:17"></i><i class="te" style="--f:34"></i></span><b>169</b></span></li>
<li class="axis" aria-hidden="true"><span class="name"></span><span class="track"><span class="ticks"><span style="--v:50">50</span><span style="--v:100">100</span><span style="--v:150">150</span><span style="--v:200">200</span><span style="--v:250">250</span></span></span></li>
</ul>
</div>
</div>
<figcaption><b>Figure 3.</b> The planned split. No page has been labelled under it yet.</figcaption>
</figure>
