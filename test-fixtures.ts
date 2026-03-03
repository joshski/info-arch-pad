export const complexDiagramSource = `
site ProductSuite
  home\t/\t(Landing & <Overview> "Alpha") {live}\t
    [ hero & promo <grid> "A" ]
    -- "Primary path for cafe users and admins in café <beta>"
    --> catalog
    --> support
    --> pricing
    ---> https://docs.example.com/api?ref=ia&mode=svg
  catalog /catalog (Browse & Compare) {live}
    [ filters & facets <dense> ]
    --> home
    --> detail
    --> cart
    detail /catalog/:id\t(Detail > Compare "Beta")\t{draft}
      [ spec sheet & upsell ]
      -- "Resume details and FAQs in résumé <important>"
      --> cart
      --> support
  pricing\t/pricing\t(Plans\tand billing)\t{draft}
    --> cart
    --> support
  cart /cart (Checkout & Pay)
    [ summary <totals> ]
    --> support
    --> home
  support /support (Help & FAQ > "Docs")
    [ contact & escalation ]
    ---> https://status.example.com/incidents?src=ia&scope=public
`;

export const complexDiagramEdgeCount = 14;
export const complexDiagramExternalEdgeCount = 2;
