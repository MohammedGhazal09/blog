(() => {
  // ponytail: Remove this shim when Sveltia stops emitting invalid button ARIA
  // and zoom-blocking viewport directives.
  const matching = (root, selector) => [
    ...(root.matches(selector) ? [root] : []),
    ...root.querySelectorAll(selector),
  ];

  const repair = (root) => {
    for (const button of matching(root, "button[aria-readonly]")) {
      button.removeAttribute("aria-readonly");
    }

    for (const viewport of matching(root, 'meta[name="viewport"]')) {
      const content = viewport.getAttribute("content") ?? "";
      const accessibleContent = content
        .split(",")
        .map((part) => part.trim())
        .filter(
          (part) =>
            !/^(?:maximum-scale|user-scalable)\s*=/iu.test(part),
        )
        .join(", ");

      if (accessibleContent !== content) {
        viewport.setAttribute("content", accessibleContent);
      }
    }
  };

  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        repair(record.target);
      } else {
        for (const node of record.addedNodes) {
          if (node instanceof Element) repair(node);
        }
      }
    }
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["aria-readonly", "content"],
    childList: true,
    subtree: true,
  });

  repair(document.documentElement);
})();
