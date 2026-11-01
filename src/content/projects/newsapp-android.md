---
# SPEC §4.5. Facts from the old site and resume only; summary is (proposed).
title: "NewsApp: Android app"
summary: Android app with Guardian news, local weather, bookmarks, keyword-trend charts and autosuggest search.
year: 2020
stack: [Android, Guardian API, OpenWeatherMap API, MPAndroidChart]
# NEEDS INPUT (N9): role/course context, and the language (Java or Kotlin? the old site does not say).
links:
  github: https://github.com/Matrix7689/NewsApp-Android
cover: ../../assets/projects/newsapp-android/cover.png
# NEEDS INPUT (N13): screenshots beyond the existing cover.
order: 2
---

An Android app that shows the latest news from the Guardian API and the weather for the user's live location from the OpenWeatherMap API. Built Mar–May 2020.

- Bookmark any article; bookmarks are saved locally with SharedPreferences.
- Graph keyword trends with the Google Trends API and MPAndroidChart.
- Search for news on a keyword with Bing Autosuggest in the search bar.
