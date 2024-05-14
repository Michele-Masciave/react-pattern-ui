import React from "react";
import { PanelSideBarProvider, PanelSideBarLayout, PanelItem, PanelLinkRendererProps } from "react-pattern-ui";
import { faBars, faCogs } from "@fortawesome/free-solid-svg-icons";

type AppRoutes = "home" | "settings" | "dropdownTest" | "dropdown-test1" | "dropdown-test2";
type TSideBarMenuItem = PanelItem<AppRoutes>;

// Configuration object for avoiding duplicated code
interface PanelSideBarConfiguration {
  renderFirstItemsLevelAsTiles?: boolean;
  useToggleButton?: boolean;
}

const getPanelSidebarInternal = (items: TSideBarMenuItem[], config?: PanelSideBarConfiguration) => {
  const { renderFirstItemsLevelAsTiles = true, useToggleButton = false } = config ?? {};
  return (
    <PanelSideBarProvider
      menuItems={items}
      renderFirstItemsLevelAsTiles={renderFirstItemsLevelAsTiles}
      LinkRenderer={(elem: PanelLinkRendererProps<AppRoutes, Record<string, unknown>>) => (
        <div
          id={elem.item.id}
          onClick={() => {
            const pageContent = document.getElementById("pageContent");
            if (pageContent) {
              pageContent.innerText = elem.item.id;
            }
          }}
        >
          <>{elem.item.title}</>
        </div>
      )}
    >
      <PanelSideBarLayout useToggleButton={useToggleButton}>
        <div id="pageContent">Cypress</div>
      </PanelSideBarLayout>
    </PanelSideBarProvider>
  );
};

const getSidebarItems = (active?: boolean, disabled?: boolean): TSideBarMenuItem[] => [
  {
    id: "home",
    title: "Home",
    icon: faBars,
    disabled,
    children: [
      {
        title: "Home",
        id: "home",
        active,
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    icon: faCogs,
    disabled,
    children: [
      {
        title: "Settings",
        id: "settings",
      },
      {
        title: "Dropdown",
        id: "dropdownTest",
        children: [
          {
            title: "Dropdown test 1",
            id: "dropdown-test1",
          },
          {
            title: "Dropdown test 2",
            id: "dropdown-test2",
            active,
          },
        ],
      },
    ],
  },
];

const PanelSideBarWithTiles = (props: { active?: boolean; disabled?: boolean }) => {
  const { active, disabled } = props;
  return getPanelSidebarInternal(getSidebarItems(active, disabled));
};

const PanelSideBarNoTiles = (props: { active?: boolean; disabled?: boolean }) => {
  const { active, disabled } = props;
  return getPanelSidebarInternal(getSidebarItems(active, disabled), { renderFirstItemsLevelAsTiles: false, useToggleButton: true });
};

describe("PanelSidebar.cy.tsx", () => {
  it("icon and titles rendered correctly", () => {
    const sidebarItems = getSidebarItems();
    cy.mount(<PanelSideBarWithTiles />);

    // Check if icon are rendered
    cy.get('[data-icon="bars"]').should("be.visible");
    cy.get('[data-icon="gears"]').should("be.visible");

    // Check if is titles are rendered
    cy.get("#home").invoke("text").should("equal", "Home");
    cy.get("button[title=Settings]").click();
    cy.get("#settings").invoke("text").should("equal", "Settings");
  });

  it("flat menu entry", () => {
    cy.mount(<PanelSideBarWithTiles />);

    // Check page content changes
    cy.get("#home").click();
    cy.get("#pageContent").invoke("text").should("equal", "home");
    cy.get("button[title=Settings]").click();
    cy.get("#settings").click();
    cy.get("#pageContent").invoke("text").should("equal", "settings");
  });

  it("nested menu entries", () => {
    cy.mount(<PanelSideBarWithTiles />);

    // Check page content changes
    cy.get("button[title=Settings]").click();
    cy.get("#settings").click();
    cy.get(".dropdown-toggle").click();
    cy.get("#dropdown-test1").click();
    cy.get("#pageContent").invoke("text").should("equal", "dropdown-test1");
    cy.get("#dropdown-test2").click();
    cy.get("#pageContent").invoke("text").should("equal", "dropdown-test2");
  });

  it("disabled entries", () => {
    cy.mount(<PanelSideBarWithTiles disabled />);

    // Check are disabled and page content not doesn't change
    cy.get("button[title=Home]").should("have.attr", "disabled");
    cy.get("button[title=Home]").click({ force: true });
    cy.get("#pageContent").invoke("text").should("equal", "Cypress");
    cy.get("button[title=Settings]").should("have.attr", "disabled");
    cy.get("button[title=Settings]").click({ force: true });
    cy.get("#pageContent").invoke("text").should("equal", "Cypress");
  });

  it("toggle sidebar", () => {
    const sidebarItems = getSidebarItems();
    cy.mount(<PanelSideBarWithTiles />);

    // Check toggle sidebar
    cy.get('[data-icon="angle-left"]').should("be.visible");
    cy.get("#side-nav-toggle").click();
    cy.get('[data-icon="angle-right"]').should("be.visible");
    cy.get(".toggled").should("exist");
    cy.get(".side-nav__items").should("not.be.visible");
  });

  it("selected flat entry", () => {
    cy.mount(<PanelSideBarWithTiles active />);

    // Check active entries
    cy.get("#home").parent("div").parent("li").should("have.class", "active");
  });

  it("render correctly menu without tiles", () => {
    cy.mount(<PanelSideBarNoTiles />);
    cy.get("#main-section").should("have.class", "section-no-tiles");
    cy.get(".side.nav__tiles").should("not.exist");
  });

  it("render correctly toggle button", () => {
    cy.mount(<PanelSideBarNoTiles />);
    cy.get("#sidebar-toggle").click();
    cy.get("#side-nav").should("have.css", "width", "0px");
  });
});
