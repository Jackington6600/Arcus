# Arcus Website Specification

## General Intro

The Arcus website will be modern, sleek, responsive, mobile friendly, and beautifully animated webiste which contains the rules for the table top role playing game (TTRPG) called Arcus.

This specifcation will outline, in great detail, the requirements, specification, use cases, and design of the site which you must follow very closely to ensure a well designed and complete website without flaws or bugs in the design.

## General Rules

You must follow best practices wherever possible, ensure general purpose code, split into separate files for better maintaining, well commented code and well tested code. Commenting should ensure good explanation of each method and section and why it is there and what it does.

## Existing Files

These files are existing files that you must make use of in the new website. They include the rules themselves in .yaml format, and images that must be included in the site.

### Existing Files List

- main_rules.yaml - The main rules for the TTRPG, this will include all textual and paragraph based descriptions of the main rule sections.
- armour.yaml - The rules for each of the three armour types. Likely to be displayed in a table or as cards/tiles.
- weapons.yaml - The rules for the weapon type examples. Displayed in a table or as cards/tiles, or as nicely laid out text.
- traits.yaml - The rules for the non-combat oriented traits that the players can gain. Displayed in a table or as cards/tiles, or as nicely laid out text.
- core_abilities.yaml - All the abilities that are available to all players at all times (with some exceptioms). Displayed in a table or as cards/tiles, or as nicely laid out text.
- class_abilities.yaml - All the abilities from classes that are available to players that gain levels in given classes. These are very important to the design of the game. Displayed in a table. or as cards/tiles, or as nicely laid out text.
- favicon-black.ico - favicon for browser UI use in light modes.
- favicon-white.ico - favicon for browser UI use in dark modes.
- arcus_spire_square.png - main background image to be used on the home/landing page background.
- "Arcus Logo Light.svg" - logo image to be used in the website in dark modes, specifically in the main browser menu at the top of the page.
- "Arcus Logo Dark.svg" - logo image to be used in the website in light modes, specifically in the main browser menu at the top of the page.

These files will need to be referenced and used elsewhere in the site. They are integral to the content of the site.

## Technical Spec

You will be using react, css, html, typescript, tailwind css, and any other integral technologies you may need, but try to keep dependencies low.

The design of the site must be as modular as possible, ensuring that:

- Separate files must be made for different css components, areas, and themes.
- Separate and generic react components should be made for all components of the website. You must pay especially close attention to this to ensure that components make sense, are reusable, customisable, and follow all the best practices. We must also ensure that they are usable in desktop and mobile format, again ensuring that we use best practices for how they change when in desktop or mobile mode.
- Components are reused where possible, to ensure the most consistent user experience.
- There must be a config file of some form (yaml or html, whichever is best practice) to specify the order and presence of content, which is then parsed and rendered by react. This config file should allow us to easily move content earlier or later in the page, change which parts of the rules are rendered, and even allow us to configure how the content is rendered (such as class abilities being in a table, or text, or as cards). It should be as simple as possible to change this config, such as id changes that reference sections in the rules yaml files because there will be frequent changes to the rules, but there shouldn't need to be frequent changes to the site code. The heavy lifting of actually rendering the content I would expect to be in typescript.

## Design

CSS should be split into sensible separate files (such as for components vs other items) that follow best practices. Use Tailwind library as much as is reasonable.

### Theme/Colour

There will be a light and dark theme for the site and we should use the following colours:

Light Theme:
  --surface: #ffffff;
  --surface-secondary: #f7f8fb;
  --surface-tertiary: #f0f2f5;
  --text-primary: #11131a;
  --text-secondary: #4b4f59;
  --text-tertiary: #6b7280;
  --muted: #4b4f59;
  --border-light: #d6d8de;
  --border-medium: #e5e8ef;

Dark Theme:
  --surface: #1a1d26;
  --surface-secondary: #252830;
  --surface-tertiary: #2d313a;
  --text-primary: #e9edf2;
  --text-secondary: #b0b8c1;
  --text-tertiary: #8b929a;
  --muted: #b0b8c1;
  --border-light: #3a3f4a;
  --border-medium: #4a4f5a;

Accents:
  --accent: #42e9ff;
  --accent-2: #a889ff;
  --gold: #e7cf8a;

You do not strictly need to use these exact colours in this exact format, but this is at least a good baseline for the theme. Feel free to add more or use different ones, even making use of tailwind. However, YOU MUST USE THE ACCENTS IN THEIR EXACT COLOUR. These accents should form the main theme for the site as they are also present in the logo for Arcus.

### Style and Animations

The style of the site should be sleek and modern, with lots of elegant animations to bring the site to life. The website is for a medieval fantasy TTRPG, but a modern design (new and better game design principals).

- Generally use slightly rounded edges.
- Use shadows and transparency and blur effects to make the site readable and beautiful and clean and clear to look at and read.
- Use font-family: Spectral,Georgia,Times New Roman,serif
- The landing page font for the main title should be font-family: Cinzel,serif.

## Content

- The site must include the following pages: Home, Full Rules, Wiki, Character Sheets, The World, GM Resources, and Blog. See details on each in the below sections, as well as the components that will make them up.

### Home

- The main landing page and page to return to when clicking the logo.
- The goal of this page is to give the user a quick idea of what is on the site, and encourage them to look at the other pages further.
- The landing page main title must be "The Spires of Arcus".
- Other flavour text for the main landing page should be:
  - (Main Summary) A pen and paper tabletop role playing game focused on thrilling tactical combat and evocative role-play in a luminous fantasy setting.
  - Fast, Tactical Combat - Every choice matters. Use unique powerful abilities, coordinate with allies, and outsmart foes by exploiting weaknesses.
  - Luminous Fantasy - Explore cities protected by soaring spires from radiant elemental storms. Uncover ancient stories across the vibrant world.
  - Elegant Design - An RPG designed with elegance and simplicity in mind. Rules are built to fit together, and fit the fantasy.
- The arcus_spire_square.png file should be the background image of this page. The image should remain filling the viewable area at all times and should remain central.
- Subtle shadows and blur effects can be used to ensure text is readable over the background image. Avoid using boxes at all around text on the home page.
- This page will have components for all of the text areas (which also contain links to the other pages).
- This page will also have the Main Menu Bar component at the top of the page.

### Full Rules

- A page that contains the full rules for the game, this will include all the rules from the yaml files (based on the config that decides which parts of the rules are present and in which format).
- The rules will be in a long scrollable format all the way down the page. This page will have the following components (along with any sub components needed): Main Content, Tabled Rule, Navigation Menu, Search Menu, Main Menu Bar. See the components below to see how these are arranged and how they function. Ensure smart and good practice when laying out these items and how the code is structured.

### Components

These components must follow best practices and ensure best generalisation, customisation, and expansion (for future development).
Components will need to be designed to adjust their content, shape, and size based on whether the user is on desktop or mobile, including converting the menus to burger menus.
There should be a mixture of global components as well as some specific ones (only when absolutely necessary).
All pages will have the Main Menu Bar at the top of each page.

#### Tabled Rule

- Tabled Rule Components are the following rules yaml files: armour.yaml, weapons.yaml, traits.yaml, core_abilities.yaml, class_abilities.yaml. These are called tabled rule components because they will need to be all put into the same component (and sub components) which allow them to be used as a fully functioning table.
- This must include the ability for them to be displayed in table format, card format, or text format. Users should be able to use the preferences menu to set which format they all display in.
- The tables should be sortable on each all columns (ascending, descending, and default). The top bar of the table (the table column headers aka the field names) should stick to the top of the screen (just below/bottom of the Main Menu Bar) as the user scrolls through the table so they can always see which column is which.
- Table component should also be side scrollable when it spills of the page, so that when used on mobile, the user can still scroll to see the entire table.
- The table rows should have subtle alternating colours.
- In all formats the Rules should be configurable (in config) which fields/columns are present in the site and which are hidden.  
- In card format the rules should be in small tiles that the user can easily copy and print. The card should be laid out in a way that makes the most sense, but we can work more on this layout in the future.
- In text format the rules should be in clearly separated and still structured text, with most fields separated into new lines.

#### Main Menu Bar

- The main menu bar will contain the site logo, the title "Arcus RPG", links to all of the pages, and a user preferences button. The bar will always be at the top of the page, even when the user scrolls down any of the pages.
- The main menu bar should condense the page links into a Main Burger Menu when the site becomes too narrow (such as on mobile), to ensure they are always displayed in a sensible way. The burger menu should of course open another component which is a simple box area which contains the list of pages as links. This box menu must be closeable, it should also close when the user clicks anywhere outside that box component.
- The preferences menu should be a simple box menu that opens, where the user can toggle between Light and Dark mode, and also set their preference on how to display the Table Rule component (table, card, or text). These preferences will just be these 2 options for now, but may expand in the future. This box menu must be closeable, it should also close when the user clicks anywhere outside that box component. As this preferences menu is similar to the Main Burger Menu in some ways, it should probably use the same base component, but then have its own sub component which determines what is displayed within it.

#### Navigation Menu

- This component will display to the side of the Main Content component on the Full Rules page. It needs to stay on the screen at all times (except in mobile mode, which I will explain later).
- This component will contain all of the headers in the Full Rules content, which will be indented any number of times based on whether they are a header, sub-header, sub-sub-header and so on.
- The navigation menu must scroll down to always show the current header in the main content component in the center of the navigation menu. It should also highlight the current heading strongly, and highlight the parent headers of this section more feintly.
- The navigation menu must also be hidden when the users viewport becomes too narrow, such as switching from desktop to mobile. The navigation menu should then display as a floating square button with a reasonable icon, that is on the screen at all times in the bottom left of the page. This can be tapped and opened, which opens the regular nagivation menu component across the whole screen (apart from the Main Menu Bar, which must always be visible) for the user to scroll and find a heading to go to. This version of the navigation menu must be closeable. It should have a close button in the top right, it should also be closeable if the user selects a heading, or if the user selects any part of the main menu bar, as links and buttons on the main menu bar should work as normal.

#### Search Menu

- The search menu should be an optional component which can either be standalone, or it can be part of the navigation menu. The one not in the navigation menu is simply an option we'd like for future development. For now the search will only be present in the navigation menu.
- The search menu should be a search bar which the user can type into and clear of all text. While the search menu is empty, no result display. But when the user starts typing, search results should start to appear (fuzzy match on section headers and rules content). The user can scroll through these result and select one, and the page will smoothly scroll to the selected section.
- The search bar content should be easily cleared with a small 'x' that appears within the right side of the search bar (only when it has text in it), which the user can click to remove its contents.
- Make this as user friendly as possible, even including the area they scroll to can flash with a highlight to show what they just searched for and may be looking for specifically.
- When the search bar is part of the navigation menu, the search results should appear within the navigation component area (instead of the headings that are normally in the navigation menu area). Effectively, when there is text in the search bar, the navigation menu is hidden while the search results show, and when the search bar is empty the navigation menu is useable as normal.
- When the search menu is in the navigation window, the search bar must always be visible (as with the rest of the navigation menu). So that the user can always easily search.
- When the user's web page becomes narrow, such as switching from desktop to mobile, the search menu should still be within the navigation menu (which is hidden but openable via a button). Search should work the same way here as it does in the regular navigation window. See that section to see how it should all behave, such as closing when the user clicks elsewhere. We should be able to use some or all of the same components here, we will just need to configure it to show correctly across the whole screen.

#### Tooltip

- On all pages, we will need to have a good configurable way of highlighting certain chosen text (with a subtle underline) as tooltip-able. When a user hovers over this subtly highlighted text, a tooltip should appear.
- We should have a very easy way to configure which text/words are tooltip-able, as we may want some words but not others. For now that can simply be a configurable list of words or phrases to look for in the rules text (ignoring headers) and paired rule ids (in main_rules.yaml), and when a matching word is found it can be highlighted.
- When the user hovers over tooltip-able text, a tooltip should appear which shows the "summary" field in a small box above or below the text highlighted (wherever there is more space). We must be sure that the tooltip will always fully display on the screen as well as possible, and none of it should be cut off by the edges of the screen. If the user moves their cursor off the tooltip-able text, then the tooltip should be closed automatically. We must also handle the mobile user case, where tapping the tooltip opens it, and the tooltip remains visible until the user taps elsewhere or scrolls.
