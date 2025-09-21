export function showDiff(oldContent, newContent, containerId) {
  const diffString = `--- Original\n+++ Updated\n@@ -1 +1 @@\n${oldContent}\n${newContent}`;
  const diffHtml = Diff2Html.html(diffString, { drawFileList: false, matching: 'lines' });
  document.getElementById(containerId).innerHTML = diffHtml;
}
