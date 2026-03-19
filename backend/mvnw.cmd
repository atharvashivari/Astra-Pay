@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a key stroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@IF "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible pre-existing ones, reset them now.
set MAVEN_MAIN_CLASS=org.apache.maven.wrapper.MavenWrapperMain

@REM ==== START VALIDATION ====
if not "%JAVA_HOME%" == "" goto OkJHome

for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
if not "%JAVACMD%" == "" goto FoundJava

echo.
echo Error: JAVA_HOME is not defined correctly.
echo   We cannot execute %JAVACMD%
echo.
goto error

:OkJHome
set "JAVACMD=%JAVA_HOME%\bin\java.exe"

:FoundJava
if exist "%JAVACMD%" goto init

echo.
echo Error: JAVA_HOME is set to an invalid directory.
echo   JAVA_HOME = "%JAVA_HOME%"
echo   Please set the JAVA_HOME variable in your environment to match the
echo   location of your Java installation.
echo.
goto error

@REM ==== END VALIDATION ====

:init

@REM Find the project base dir, i.e. the directory that contains the folder ".mvn".
@REM Fallback to current working directory if not found.

set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
if not "%MAVEN_PROJECTBASEDIR%" == "" goto endDetectBaseDir

set EXEC_DIR=%CD%
set W_DIR=%CD%
:findBaseDir
if exist "%W_DIR%\.mvn" (
  set "MAVEN_PROJECTBASEDIR=%W_DIR%"
  goto endDetectBaseDir
)
cd ..
if "%W_DIR%" == "%CD%" goto baseDirNotFound
set W_DIR=%CD%
goto findBaseDir

:baseDirNotFound
set MAVEN_PROJECTBASEDIR=%EXEC_DIR%

:endDetectBaseDir
cd "%EXEC_DIR%"

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"
set MAVEN_OPTS=%MAVEN_OPTS% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%"

@REM Start MAVEN
%JAVACMD% %MAVEN_OPTS% -classpath %WRAPPER_JAR% %MAVEN_MAIN_CLASS% %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_SKIP_RC%" == "" goto skipRcPost
@IF EXIST "%USERPROFILE%\mavenrc_post.bat" call "%USERPROFILE%\mavenrc_post.bat"
@IF EXIST "%USERPROFILE%\mavenrc_post.cmd" call "%USERPROFILE%\mavenrc_post.cmd"
:skipRcPost

if "%MAVEN_BATCH_PAUSE%" == "on" pause

if "%MAVEN_TERMINATE_CMD%" == "on" exit %ERROR_CODE%

exit /B %ERROR_CODE%
