"""
ORBIT — Typed Agent Tools Interface.
Exposes strictly typed tools accessible to agents:
  fs.write(path, content)      fs.read(path)
  fs.patch(path, unified_diff) fs.list(glob)
  shell.exec(cmd, timeout)     pkg.install(manager, deps)
  test.run(framework)          http.probe(url, expect_status)
  artifact.zip()               artifact.upload()
"""
from app.tools import artifact, fs, shell, test
from app.tools.context import bind_sandbox, get_current_sandbox, set_current_sandbox
from app.tools.shell import http, pkg

__all__ = [
    "fs",
    "shell",
    "pkg",
    "http",
    "test",
    "artifact",
    "bind_sandbox",
    "get_current_sandbox",
    "set_current_sandbox",
]
