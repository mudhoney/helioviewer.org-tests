import { test } from "@playwright/test";
import { Helioviewer } from "../../../page_objects/helioviewer";
import { mockEvents } from "../../../utils/events";

/**
 * This test is a regression test for proving issue 680 is fixed for the given helioviewer
 * This is a bug related with the unicode processing of event labels
 * @see https://github.com/Helioviewer-Project/helioviewer.org/issues/680
 */
test("Issue 680, Unicode processing of event labels", async ({ page }, info) => {
  // mocked event data with unicode characters and HTML entities in event labels
  const events = {
    HEK: {
      "Active Region": {
        SPoCA: {
          "SPoCA \u03B1-37775": {},
          "SPoCA \u03B2-37776": {},
          "SPoCA \u03B3-37777": {},
          "SPoCA \u03B4-37778": {},
          "SPoCA \u03B5-37779": {}
        },
        "NOAA SWPC Observer": {
          "NOAA \u03B6-13814": {},
          "NOAA \u03B7-13815": {},
          "NOAA \u03B8-13816": {},
          "NOAA \u03B9-13817": {},
          "NOAA \u03BA-13818": {}
        }
      },
      "Coronal Hole": {
        SPoCA: {
          "SPoCA \u03BB-49106": {},
          "SPoCA \u03BC-49144": {},
          "SPoCA \u03BD-49145": {},
          "SPoCA \u03BE-49146": {},
          "SPoCA \u03BF-49147": {}
        }
      }
    },
    CCMC: {
      DONKI: {
        CME: {
          "Type:C \u03C0 &amp; 456km": {},
          "Type:B \u03C1 &lt;789km&gt;": {},
          "Type:A \u03C3 &quot;123km&quot;": {},
          "Type:D \u03C4 &#39;456km&#39;": {},
          "Type:E \u03C5 &deg;789km": {}
        }
      },
      "Solar Flare Predictions": {
        AMOS: {
          "C+ \u03C6% &amp; M+: 2.82%": {},
          "C+ \u03C7% &lt;M+&gt;: 9.08%": {},
          "C+ \u03C8% &quot;X&quot;: 0%": {},
          "C+ \u03C9% &#39;M&#39;: 1.5%": {},
          "C+ \u0394% &deg;X: 0.1%": {}
        }
      }
    }
  };

  // mock events
  await mockEvents(page, events);

  // load helioviewer
  let hv = new Helioviewer(page, info);

  // Action 1 : BROWSE TO HELIOVIEWER
  await hv.Load();
  await hv.WaitForLoadingComplete();
  await hv.CloseAllNotifications();

  // Action 2 : Open left sources panel
  await hv.OpenSidebar();

  // Action 3: Open events drawer
  await hv.OpenEventsDrawer();

  // Action 4: Test HEK events with unicode characters (test with readable chars)
  const hekTree = hv.parseTree("HEK");

  await hekTree.toggleBranchFRM("Active Region", "SPoCA");

  // Check that unicode event labels are properly displayed for HEK
  await hekTree.assertEventInstanceTreeNodeLabel("Active Region", "SPoCA", "SPoCA \u03B1-37775", "SPoCA α-37775");
  await hekTree.assertEventInstanceTreeNodeLabel("Active Region", "SPoCA", "SPoCA \u03B2-37776", "SPoCA β-37776");
  await hekTree.assertEventInstanceTreeNodeLabel("Active Region", "SPoCA", "SPoCA \u03B3-37777", "SPoCA γ-37777");
  await hekTree.assertEventInstanceTreeNodeLabel("Active Region", "SPoCA", "SPoCA \u03B4-37778", "SPoCA δ-37778");
  await hekTree.assertEventInstanceTreeNodeLabel("Active Region", "SPoCA", "SPoCA \u03B5-37779", "SPoCA ε-37779");

  await hekTree.toggleBranchFRM("Active Region", "NOAA SWPC Observer");
  await hekTree.assertEventInstanceTreeNodeLabel(
    "Active Region",
    "NOAA SWPC Observer",
    "NOAA \u03B6-13814",
    "NOAA ζ-13814"
  );
  await hekTree.assertEventInstanceTreeNodeLabel(
    "Active Region",
    "NOAA SWPC Observer",
    "NOAA \u03B7-13815",
    "NOAA η-13815"
  );
  await hekTree.assertEventInstanceTreeNodeLabel(
    "Active Region",
    "NOAA SWPC Observer",
    "NOAA \u03B8-13816",
    "NOAA θ-13816"
  );
  await hekTree.assertEventInstanceTreeNodeLabel(
    "Active Region",
    "NOAA SWPC Observer",
    "NOAA \u03B9-13817",
    "NOAA ι-13817"
  );
  await hekTree.assertEventInstanceTreeNodeLabel(
    "Active Region",
    "NOAA SWPC Observer",
    "NOAA \u03BA-13818",
    "NOAA κ-13818"
  );

  await hekTree.toggleBranchFRM("Coronal Hole", "SPoCA");
  await hekTree.assertEventInstanceTreeNodeLabel("Coronal Hole", "SPoCA", "SPoCA \u03BB-49106", "SPoCA λ-49106");
  await hekTree.assertEventInstanceTreeNodeLabel("Coronal Hole", "SPoCA", "SPoCA \u03BC-49144", "SPoCA μ-49144");
  await hekTree.assertEventInstanceTreeNodeLabel("Coronal Hole", "SPoCA", "SPoCA \u03BD-49145", "SPoCA ν-49145");
  await hekTree.assertEventInstanceTreeNodeLabel("Coronal Hole", "SPoCA", "SPoCA \u03BE-49146", "SPoCA ξ-49146");
  await hekTree.assertEventInstanceTreeNodeLabel("Coronal Hole", "SPoCA", "SPoCA \u03BF-49147", "SPoCA ο-49147");

  // Action 5: Test CCMC events with unicode characters and HTML entities (test with readable chars)
  const ccmcTree = hv.parseTree("CCMC");

  // Check that unicode + HTML entities are properly displayed for CCMC
  await ccmcTree.toggleBranchFRM("DONKI", "CME");
  await ccmcTree.assertEventInstanceTreeNodeLabel("DONKI", "CME", "Type:C \u03C0 &amp; 456km", "Type:C π & 456km");
  await ccmcTree.assertEventInstanceTreeNodeLabel("DONKI", "CME", "Type:B \u03C1 &lt;789km&gt;", "Type:B ρ <789km>");
  await ccmcTree.assertEventInstanceTreeNodeLabel(
    "DONKI",
    "CME",
    "Type:A \u03C3 &quot;123km&quot;",
    'Type:A σ "123km"'
  );
  await ccmcTree.assertEventInstanceTreeNodeLabel("DONKI", "CME", "Type:D \u03C4 &#39;456km&#39;", "Type:D τ '456km'");
  await ccmcTree.assertEventInstanceTreeNodeLabel("DONKI", "CME", "Type:E \u03C5 &deg;789km", "Type:E υ °789km");

  await ccmcTree.toggleBranchFRM("Solar Flare Predictions", "AMOS");
  await ccmcTree.assertEventInstanceTreeNodeLabel(
    "Solar Flare Predictions",
    "AMOS",
    "C+ \u03C6% &amp; M+: 2.82%",
    "C+ φ% & M+: 2.82%"
  );
  await ccmcTree.assertEventInstanceTreeNodeLabel(
    "Solar Flare Predictions",
    "AMOS",
    "C+ \u03C7% &lt;M+&gt;: 9.08%",
    "C+ χ% <M+>: 9.08%"
  );
  await ccmcTree.assertEventInstanceTreeNodeLabel(
    "Solar Flare Predictions",
    "AMOS",
    "C+ \u03C8% &quot;X&quot;: 0%",
    'C+ ψ% "X": 0%'
  );
  await ccmcTree.assertEventInstanceTreeNodeLabel(
    "Solar Flare Predictions",
    "AMOS",
    "C+ \u03C9% &#39;M&#39;: 1.5%",
    "C+ ω% 'M': 1.5%"
  );
  await ccmcTree.assertEventInstanceTreeNodeLabel(
    "Solar Flare Predictions",
    "AMOS",
    "C+ \u0394% &deg;X: 0.1%",
    "C+ Δ% °X: 0.1%"
  );
});
